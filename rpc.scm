#!/usr/bin/guile -s
!#

(load "sha.scm")

(use-modules (json)
             (dbi dbi)
             (ice-9 regex)
             (curl))


(define (now)
    (strftime "%e %h %Y %R:%S %z" (localtime (current-time))))

(define db (dbi-open "sqlite3" "notes.db"))

(dbi-query db (string-append "CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY"
                             " AUTOINCREMENT, username VARCHAR(256), password VARCHAR"
                             "(40), salt VARCHAR(40), email VARCHAR(256), active INTE"
                             "GER)"))
(dbi-query db (string-append "CREATE TABLE IF NOT EXISTS activation(id INTEGER PRIMAR"
                             "Y KEY AUTOINCREMENT, user INTEGER, token VARCHAR(40))"))

(dbi-query db (string-append "CREATE TABLE IF NOT EXISTS tokens(id INTEGER PRIMARY KE"
                             "Y AUTOINCREMENT, token VARCHAR(32), user INTEGER)"))
(dbi-query db (string-append "CREATE TABLE IF NOT EXISTS notes(id INTEGER PRIMARY KEY"
                             " AUTOINCREMENT, user INTEGER, content TEXT)"))


(define (dbi-get-all db)
    (let iter ((result '()))
         (let ((row (dbi-get_row db)))
           (if (not row)
               (reverse result)
             (iter (cons row result))))))

(define (port->string port)
    (let iter ((result '()) (chr (read-char port)))
         (if (eof-object? chr)
             (list->string result)
           (iter (append result (list chr)) (read-char port)))))

(define (get-input-data)
    (port->string (current-input-port)))

(define (file-json->scm filename)
    (json-string->scm (port->string (open-input-file filename))))

(define config (file-json->scm "config.json"))

(display "Content-Type: application/json")
(newline)
(newline)

(define (print string)
  (display string)
  (newline))

(define post-data (get-input-data))

(define (json-response id result error)
  (scm->json-string `(("id" . ,id) ("result" . ,result) ("error" . ,error))))

(define (string->sha1 string)
    (let ((port (open-input-string string)))
      (hex (sha1 port))))

(define (rand n)
    (random n (seed->random-state (current-time))))

(define (create-user username email password)
    (if (not (get-user username))
        (let ((salt (string->sha1 (number->string (rand 100000000000000)))))
          (dbi-query db (string-append "INSERT INTO users(username, password, salt, "
                                       "email, active) VALUES('"
                                       (escape-string username)
                                       "','"
                                       (string->sha1 (string-append password salt))
                                       "','"
                                       salt
                                       "','"
                                       (escape-string email)
                                       "',0)"))
          (dbi-query db (string-append "SELECT * FROM users WHERE username = '"
                                       (escape-string username)
                                       "'"))
          (let ((id (cdr (assoc "id" (dbi-get_row db))))
                (token (string->sha1 (number->string (rand 100000000000000)))))
            (dbi-query db (string-append "INSERT INTO activation(user, token) VALUES("
                                         (number->string id)
                                         ",'"
                                         token
                                         "')"))
            token))
  (throw 'error "user already exists")))


(define (regex-replace regex substitution subject)
    (regexp-substitute/global #f regex subject 'pre substitution 'post))

(define (escape-string string)
    (regex-replace "'" "''" string))

(define (get-user username)
    (dbi-query db (string-append "SELECT * FROM users WHERE username = '"
                                 (escape-string username)
                                 "'"))
  (dbi-get_row db))

(define (valid-password user password)
    "validate user"
  (if user
      (let ((salt (cdr (assoc "salt" user)))
            (hash-password (cdr (assoc "password" user))))
        (equal? (string->sha1 (string-append password salt)) hash-password))
    #f))

(define (mail to subject message . verbose)
    (define data-port
        (open-input-string (string-append
                            "From: noreplay@notes.jcubic.pl\r\n"
                            "To: " to "\r\n"
                            "Subject: " subject "\r\n"
                            "Date: " (now) "\r\n"
                            "\r\n"
                            message
                            "\r\n")))

  (define handle (curl-easy-init))
  (define email (hash-ref config "email"))
  (curl-easy-setopt handle 'url "smtp://mail.jcubic.pl")
  (if (and (not (null? verbose)) (car verbose))
      (curl-easy-setopt handle 'verbose #t))
  (curl-easy-setopt handle 'ssl-verifyhost 0)
  (curl-easy-setopt handle 'ssl-verifypeer #f)
  (curl-easy-setopt handle 'use-ssl CURLUSESSL_NONE)
  (curl-easy-setopt handle 'username (hash-ref email "user"))
  (curl-easy-setopt handle 'password (hash-ref email "password"))
  (curl-easy-setopt handle 'mail-from (hash-ref email "email"))
  (curl-easy-setopt handle 'mail-rcpt (list to))
  (curl-easy-setopt handle 'readdata data-port)
  (curl-easy-setopt handle 'upload #t )
  (curl-easy-perform handle))

(eval-when (expand)
  (define (input-list body)
      (list 'quasiquote (map (lambda (pair)
                               (cons (car pair)
                                     (list 'unquote (cdr pair))))
                             body))))
(eval-when (expand)
  (define (definition body)
      (list 'quote (map (lambda (pair)
                          (list (cons "name" (symbol->string (car pair)))
                                (cons "params" (map symbol->string (caddr pair)))))
                        body))))

(defmacro JSON-RPC (name alist)
  (let ((input (gensym)))
    `(catch 'json-invalid
       (lambda ()
         (let* ((,input ,(input-list alist))
                (request (json-string->scm post-data))
                (method (hash-ref request "method"))
                (id (hash-ref request "id"))
                (input-params (hash-ref request "params" '()))
                (def ,(definition alist))
                (method-def (find (lambda (def)
                                    (equal? method (cdr (assoc "name" def))))
                                  def))
                (params (if method-def (cdr (assoc "params" method-def)) '())))
           (if (or (not method) (not id))
               (print (json-response id #nil "wrong request"))
             (if (equal? method "system.describe")
                 (print (json-response id `(("name" . ,,name) ("procs" . ,def)) #nil))
               (let ((fun (assoc (string->symbol method) ,input)))
                 (if (not (pair? fun))
                     (print (json-response id #nil "wrong method"))
                   (let ((args-given (length input-params))
                         (args-expected (length params)))
                     (if (not (eq? args-given args-expected))
                         (let ((message (string-append "wrong number of arguments"
                                                       " got "
                                                       (number->string args-given)
                                                       " expected "
                                                       (number->string args-expected))))
                         (print (json-response id #nil message)))
                       (catch 'error
                         (lambda ()
                           (print (json-response id (apply (cdr fun) input-params) #nil)))
                         (lambda (key . args)
                           (print (json-response id #nil (car args)))))))))))))
       (lambda (key . args)
         (print (print (json-response #nil #nil "parse error")))))))


(use-modules (language tree-il))
;;(setlocale LC_ALL "")

(JSON-RPC "service"
          ((login . (lambda (username password)
                      (let ((user (get-user username)))
                        (if (not user)
                            (throw 'error "Wrong username")
                          (let ((active (cdr (assoc "active" user))))
                            (if (eq? active 0)
                                (throw 'error "user not active")
                              (if (not (valid-password user password))
                                  (throw 'error "wrong password")
                                (let ((token (string->sha1 (number->string (current-time))))
                                      (userid (cdr (assoc "id" user))))
                                  (dbi-query db (string-append "INSERT INTO tokens(token, "
                                                               "user) VALUES('"
                                                               token
                                                               "',"
                                                               (number->string userid)
                                                               ")"))
                                  token))))))))
           (valid_token . (lambda (username token)
                            (dbi-query db (string-append "SELECT username, token FROM users"
                                                         " u, tokens t WHERE u.id = t.user"
                                                         " AND t.token = '"
                                                         (escape-string token)
                                                         "' AND u.username = '"
                                                         (escape-string username)
                                                         "'"))
                            (let ((row (dbi-get_row db)))
                              (if row
                                  (and (equal? token (cdr (assoc "token" row)))
                                       (equal? username (cdr (assoc "username" row))))
                                #f))))
           (register . (lambda (username email password)
                         (let ((token (create-user username email password)))
                           (if token
                               (let ((subject "activation key")
                                     (message (string-append "Your activation key is: "
                                                             token)))
                                 (mail email subject message)
                                 #t)
                             #f))))
           (activate . (lambda (token)
                         (dbi-query db (string-append "SELECT * FROM activation WHERE token"
                                                      "= '"
                                                      (escape-string token)
                                                      "'"))
                         (let ((row (dbi-get_row db)))
                           (if row
                               (let ((user (cdr (assoc "user" row))))
                                 (dbi-query db (string-append "UPDATE users SET active = 1"
                                                              " WHERE id = "
                                                              (number->string user)))
                                 (dbi-query db (string-append "DELETE FROM activation WHERE"
                                                              " token = '"
                                                              (escape-string token)
                                                              "'"))
                                 #t)
                             (throw 'error "Invalid activation code")))))))

(dbi-close db)


