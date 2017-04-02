<?php

class Service {
    function __construct($db, $config) {
        $this->db = new PDO('sqlite:' . $db);
        $this->init();
        $config_name = "config.json";
        if (file_exists($config)) {
            $this->config = json_decode(file_get_contents($config));
        } else {
            $this->config = null;
        }
    }

    // -----------------------------------------------------------------------------------
    private function init() {
        $this->query("CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY" .
                     " AUTOINCREMENT, username VARCHAR(256), password VARCHAR" .
                     "(40), salt VARCHAR(40), email VARCHAR(256), active INTE" .
                     "GER)");
        $this->query("CREATE TABLE IF NOT EXISTS activations(id INTEGER PRIMAR" .
                     "Y KEY AUTOINCREMENT, user INTEGER, key VARCHAR(40))");
        $this->query("CREATE TABLE IF NOT EXISTS tokens(id INTEGER PRIMARY KE" .
                     "Y AUTOINCREMENT, token VARCHAR(32), user INTEGER)");
        $this->query("CREATE TABLE IF NOT EXISTS notes(id INTEGER PRIMARY KEY" .
                     " AUTOINCREMENT, user INTEGER, content TEXT)");
    }

    // -----------------------------------------------------------------------------------
    private function query($query, $params = null) {
        if (!$params) {
            $res = $this->db->query($query);
        } else {
            $res = $this->db->prepare($query);
            if ($res) {
                $res->execute($params);
            }
        }
        if ($res) {
            if (preg_match("/^\s*INSERT/i", $query)) {
                return $this->db->lastInsertId();
            } else if (preg_match("/^\s*UPDATE|DELETE|ALTER|CREATE|DROP/i", $query)) {
                return $res->rowCount();
            } else {
                return $res->fetchAll(PDO::FETCH_ASSOC);
            }
        } else {
            $error = $this->db->errorInfo();
            throw new Exception("SQLite error " . $error[2]);
        }
    }

    // -----------------------------------------------------------------------------------
    private function token() {
        $time = array_sum(explode(' ', microtime()));
        return sha1($time);
    }

    // -----------------------------------------------------------------------------------
    private function get_user($username) {
        $array = $this->query("SELECT * FROM users WHERE username = ?", array($username));
        if (empty($array)) {
            return null;
        } else {
            return $array[0];
        }
    }

    // -----------------------------------------------------------------------------------
    private function create_user($username, $email, $password) {
        if (!empty($this->get_user($username))) {
            throw new Exception("User with this username already exist");
        } else {
            $salt = $this->token();
            $query = "INSERT INTO users(username, password, salt, email, active) " .
                   "VALUES(?, ?, ?, ?, ?)";
            $id = $this->query($query, array(
                $username,
                sha1($password . $salt),
                $salt,
                $email,
                0
            ));
            $activations_key = $this->token();
            $query = "INSERT INTO activations(user, key) VALUES(?, ?)";
            if ($this->query($query, array($id, $activations_key))) {
                return $activations_key;
            } else {
                return null;
            }
        }
    }

    // -----------------------------------------------------------------------------------
    function username_taken($username) {
        return !empty($this->get_user($username));
    }

    // -----------------------------------------------------------------------------------
    private function valid_password($user, $password) {
        return sha1($password . $user['salt']) == $user['password'];
    }

    // -----------------------------------------------------------------------------------
    private function send_mail($to, $subject, $message) {
        if (!$this->config) {
            throw new Exception("Can't send email no config file");
        } else {
            $version = phpversion();
            $host = gethostname();
            $headers = "From: noreplay@${host}\r\nX-Mailer: PHP/$version";
            return mail($to, $subject, $message, $headers);
        }
    }

    // -----------------------------------------------------------------------------------
    function register($username, $email, $password) {
        $token = $this->create_user($username, $email, $password);
        if ($token) {
            $message = "Your activations key is: " . $token;
            if ($this->send_mail($email, "registratation", $message)) {
                return true;
            } else {
                return $token;
            }
        } else {
            return false;
        }
    }

    // -----------------------------------------------------------------------------------
    function valid_token($username, $token) {
        $query = "SELECT username, token FROM users u, tokens t WHERE u.id = t.user " .
               "AND u.username = ? AND t.token = ?";
        return !empty($this->query($query, array($username, $token)));
    }

    // -----------------------------------------------------------------------------------
    function activate($activations_key) {
        $query = "SELECT * FROM activations a, users u WHERE key = ? AND u.id = a.user";
        $activations = $this->query($query, array($activations_key));
        if (empty($activations)) {
            throw new Exception("Wrong activations code");
        }
        $activations = $activations[0];
        $userid = $activations['user'];
        $count = $this->query("UPDATE users SET active = 1 WHERE id = ?", array($userid));
        if ($count != 1) {
            throw new Exception("Coudn't update users table");
        } else {
            $this->query("DELETE FROM activations WHERE key = ?", array($activations_key));
        }
        return $this->auth($activations['user']);
    }

    // -----------------------------------------------------------------------------------
    private function auth($userid) {
        $token = $this->token();
        $id = $this->query("INSERT INTO tokens(token, user) VALUES(?, ?)", array(
            $token,
            $userid
        ));
        if ($id) {
            return $token;
        } else {
            return null;
        }
    }

    // -----------------------------------------------------------------------------------
    function login($username, $password) {
        $user = $this->get_user($username);
        if (empty($user)) {
            throw new Exception("Invalid username");
        }
        if (!$this->valid_password($user, $password)) {
            throw new Exception("Invalid Password");
        }
        if (!$user['active']) {
            throw new Exception("User not active");
        }
        return $this->auth($user['id']);
    }

    // -----------------------------------------------------------------------------------
    function logout($token, $username) {
        $data = $this->query("SELECT * FROM users u, tokens t WHERE t.token = ? AND " .
                             "t.user = u.id", array($token));
        if (empty($data)) {
            throw new Exception("Invalid token");
        }
        if (count($data) > 1) {
            throw new Exception("Internal: more then one token");
        }
        $data = $data[0];
        if ($data['username'] != $username) {
            throw new Exception("Invalid username");
        }
        if (!$this->query("DELETE FROM tokens WHERE token = ?", array($token))) {
            throw new Exception("Couldn't delete token");
        }
    }
}

error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE);
ini_set('display_errors', 'On');
require_once("json-rpc.php");

$service = new Service("notes.db", "config.json");
handle_json_rpc($service);
echo "\n";
