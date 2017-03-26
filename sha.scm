(use-modules (srfi srfi-1) (srfi srfi-26) (srfi srfi-43) (srfi srfi-60)
             (rnrs bytevectors) (ice-9 binary-ports) (srfi srfi-11))

(define* (bytevector-copy bv #:optional (start 0) (end (bytevector-length bv)))
  (define copy (make-bytevector (- end start)))
  (bytevector-copy! copy 0 bv start end)
  copy)
(define* (bytevector-copy! to at from #:optional (start 0)
                                                 (end (bytevector-length from)))
  ((@ (rnrs bytevectors) bytevector-copy!) from start to at (- end start)))
(define* (read-bytevector! bv #:optional (port (current-input-port)) (start 0)
                                         (end (bytevector-length bv)))
  (get-bytevector-n! port bv start (- end start)))


;; Auxiliary definitions to avoid having to use giant tables of constants.

(define primes80 '(2 3 5 7 11 13 17 19 23 29 31 37 41 43 47 53 59 61 67 71 73
                   79 83 89 97 101 103 107 109 113 127 131 137 139 149 151 157
                   163 167 173 179 181 191 193 197 199 211 223 227 229 233 239
                   241 251 257 263 269 271 277 281 283 293 307 311 313 317 331
                   337 347 349 353 359 367 373 379 383 389 397 401 409))

(define (sqrt x)
  (fold (lambda (_ y) (/ (+ (/ x y) y) 2)) 4 (iota 7)))

(define (cbrt x)
  (fold (lambda (_ y) (/ (+ (/ x y y) y y) 3)) 4 (iota 8)))

(define (frac x scale base)
  (bitwise-and (floor (* x (arithmetic-shift 1 scale)))
               (- (arithmetic-shift 1 base) 1)))

;;; The actual initialisation and constant values.

(define sha1-init '(#x67452301 #xefcdab89 #x98badcfe #x10325476 #xc3d2e1f0))
(define sha2-init (map (lambda (x) (frac (sqrt x) 64 64)) (take primes80 16)))
(define-values (sha512-init sha384-init) (split-at sha2-init 8))
(define sha256-init (map (cut arithmetic-shift <> -32) sha512-init))
(define sha224-init (map (cut frac <> 0 32) sha384-init))

(define sha1-const (map (lambda (x) (frac (sqrt x) 30 32)) '(2 3 5 10)))
(define sha512-const (map (lambda (x) (frac (cbrt x) 64 64)) primes80))
(define sha256-const (map (cut arithmetic-shift <> -32) (take sha512-const 64)))

;;; Utility functions used by the compression and driver functions.

(define (u32+ . xs) (bitwise-and (apply + xs) #xffffffff))
(define (u64+ . xs) (bitwise-and (apply + xs) #xffffffffffffffff))
(define (bitwise-majority x y z)
  (bitwise-xor (bitwise-and x y) (bitwise-and x z) (bitwise-and y z)))

(define (bytevector-be-ref bv base n)
  (let loop ((res 0) (i 0))
    (if (< i n)
        (loop (+ (arithmetic-shift res 8) (bytevector-u8-ref bv (+ base i)))
              (+ i 1))
        res)))
(define (bytevector-u64-ref bv i)
  (bytevector-be-ref bv (arithmetic-shift i 3) 8))
(define (bytevector-u32-ref bv i)
  (bytevector-be-ref bv (arithmetic-shift i 2) 4))

(define (bytevector-be-set! bv base n val)
  (let loop ((i n) (val val))
    (when (positive? i)
      (bytevector-u8-set! bv (+ base i -1) (bitwise-and val 255))
      (loop (- i 1) (arithmetic-shift val -8)))))

(define (md-pad! bv offset count counter-size)
  (define block-size (bytevector-length bv))
  (unless (negative? offset)
    (bytevector-u8-set! bv offset #x80))
  (let loop ((i (+ offset 1)))
    (when (< i block-size)
      (bytevector-u8-set! bv i 0)
      (loop (+ i 1))))
  (when count
    (bytevector-be-set! bv (- block-size counter-size) counter-size
                        (arithmetic-shift count 3))))

(define (hash-state->bytevector hs trunc word-size)
  (define result (make-bytevector (* trunc word-size)))
  (for-each (lambda (h i)
              (bytevector-be-set! result i word-size h))
            hs (iota trunc 0 word-size))
  result)

;;; The compression functions.

(define (sha2-compress K Σ0 Σ1 σ0 σ1 mod+ getter hs)
  (define W (vector->list (apply vector-unfold
                                 (lambda (_ a b c d e f g h i j k l m n o p)
                                   (values a b c d e f g h i j k l m n o p
                                           (mod+ a (σ0 b) j (σ1 o))))
                                 (length K)
                                 (list-tabulate 16 getter))))
  (define (loop k w a b c d e f g h)
    (if (null? k)
        (map mod+ hs (list a b c d e f g h))
        (let ((T1 (mod+ h (Σ1 e) (bitwise-if e f g) (car k) (car w)))
              (T2 (mod+ (Σ0 a) (bitwise-majority a b c))))
          (loop (cdr k) (cdr w) (mod+ T1 T2) a b c (mod+ d T1) e f g))))
  (apply loop K W hs))

(define (sha512-compress bv hs)
  (define (rotr x y) (rotate-bit-field x (- y) 0 64))
  (define (shr x y) (arithmetic-shift x (- y)))
  (sha2-compress sha512-const
                 (lambda (x) (bitwise-xor (rotr x 28) (rotr x 34) (rotr x 39)))
                 (lambda (x) (bitwise-xor (rotr x 14) (rotr x 18) (rotr x 41)))
                 (lambda (x) (bitwise-xor (rotr x 1) (rotr x 8) (shr x 7)))
                 (lambda (x) (bitwise-xor (rotr x 19) (rotr x 61) (shr x 6)))
                 u64+ (cut bytevector-u64-ref bv <>) hs))

(define (sha256-compress bv hs)
  (define (rotr x y) (rotate-bit-field x (- y) 0 32))
  (define (shr x y) (arithmetic-shift x (- y)))
  (sha2-compress sha256-const
                 (lambda (x) (bitwise-xor (rotr x 2) (rotr x 13) (rotr x 22)))
                 (lambda (x) (bitwise-xor (rotr x 6) (rotr x 11) (rotr x 25)))
                 (lambda (x) (bitwise-xor (rotr x 7) (rotr x 18) (shr x 3)))
                 (lambda (x) (bitwise-xor (rotr x 17) (rotr x 19) (shr x 10)))
                 u32+ (cut bytevector-u32-ref bv <>) hs))

(define (sha1-compress bv hs)
  (define (getter x) (bytevector-u32-ref bv x))
  (define (rotl x y) (rotate-bit-field x y 0 32))
  (define W (vector->list (apply vector-unfold
                                 (lambda (_ a b c d e f g h i j k l m n o p)
                                   (values a b c d e f g h i j k l m n o p
                                           (rotl (bitwise-xor a c i n) 1)))
                                 80
                                 (list-tabulate 16 getter))))
  (define (outer f k w a b c d e)
    (if (null? k)
        (map u32+ hs (list a b c d e))
        (let inner ((i 0) (w w) (a a) (b b) (c c) (d d) (e e))
          (if (< i 20)
              (let ((T (u32+ (rotl a 5) ((car f) b c d) e (car k) (car w))))
                (inner (+ i 1) (cdr w) T a (rotl b 30) c d))
              (outer (cdr f) (cdr k) w a b c d e)))))
  (apply outer (list bitwise-if bitwise-xor bitwise-majority bitwise-xor)
               sha1-const W hs))

;;; The Merkle-Damgård "driver" function.

(define (md-loop init compress block-size trunc word-size counter-size in)
  (define leftover (- block-size counter-size))
  (define bv (make-bytevector block-size))
  (define pad! (cut md-pad! bv <> <> counter-size))
  (define hs->bv (cut hash-state->bytevector <> trunc word-size))

  (let loop ((count 0) (hs init))
    (define read-size (read-bytevector! bv in))
    (cond ((eof-object? read-size)
           (pad! 0 count)
           (hs->bv (compress bv hs)))
          ((= read-size block-size)
           (loop (+ count read-size) (compress bv hs)))
          ((< read-size leftover)
           (pad! read-size (+ count read-size))
           (hs->bv (compress bv hs)))
          (else
           (pad! read-size #f)
           (let ((pen (compress bv hs)))
             (pad! -1 (+ count read-size))
             (hs->bv (compress bv pen)))))))

;;; SHA-512/t stuff.

(define sha512/t-init (map (cut bitwise-xor <> #xa5a5a5a5a5a5a5a5) sha512-init))
(define (make-sha512/t-init t)
  (define key (string->utf8 (string-append "SHA-512/" (number->string t))))
  (define size (bytevector-length key))
  (define bv (make-bytevector 128))
  (bytevector-copy! bv 0 key)
  (md-pad! bv size size 16)
  (sha512-compress bv sha512/t-init))

(define (make-sha512/t t)
  (define init (make-sha512/t-init t))
  (define words (arithmetic-shift t -6))
  (if (zero? (bitwise-and t 63))
      (cut md-loop init sha512-compress 128 words 8 16 <>)
      (lambda (in)
        (bytevector-copy
         (md-loop init sha512-compress 128 (ceiling words) 8 16 in)
         0 (arithmetic-shift t -3)))))

;;; Public entry points.

(define sha1 (cut md-loop sha1-init sha1-compress 64 5 4 8 <>))
(define sha224 (cut md-loop sha224-init sha256-compress 64 7 4 8 <>))
(define sha256 (cut md-loop sha256-init sha256-compress 64 8 4 8 <>))
(define sha384 (cut md-loop sha384-init sha512-compress 128 6 8 16 <>))
(define sha512 (cut md-loop sha512-init sha512-compress 128 8 8 16 <>))
(define sha512/256 (make-sha512/t 256))
(define sha512/224 (make-sha512/t 224))

(define (hex bv)
  (define out (open-output-string))
  (do ((i 0 (+ i 1)))
      ((>= i (bytevector-length bv)) (get-output-string out))
    (let-values (((q r) (truncate/ (bytevector-u8-ref bv i) 16)))
      (display (number->string q 16) out)
      (display (number->string r 16) out))))
