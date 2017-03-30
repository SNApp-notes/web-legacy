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
        $this->query("CREATE TABLE IF NOT EXISTS activation(id INTEGER PRIMAR" .
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
            $activation_key = $this->token();
            $query = "INSERT INTO activation(user, key) VALUES(?, ?)";
            if ($this->query($query, array($id, $activation_key))) {
                return $activation_key;
            } else {
                return null;
            }
        }
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
            $message = "Your activation key is: " . $token;
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
    function activate($activation_key) {
        $query = "SELECT * FROM activation WHERE key = ?";
        $activation = $this->query($query, array($activation_key));
        if (empty($activation)) {
            throw new Exception("Wrong activation code");
        }
        $userid = $activation[0]['user'];
        $count = $this->query("UPDATE users SET active = 1 WHERE id = ?", array($userid));
        if ($count != 1) {
            throw new Exception("Coudn't update users table");
        } else {
            $this->query("DELETE FROM activation WHERE key = ?", array($activation_key));
        }
    }

    // -----------------------------------------------------------------------------------
    function login($username, $password) {
        $user = $this->get_user($username);
        if (empty($user)) {
            throw new Exception("Invalid username");
        }
        if (!$this->valid_password($user, $password)) {
            throw new Exception("Invalid Passoword");
        }
        if (!$user['active']) {
            throw new Exception("User not active");
        }
        $token = $this->token();
        $id = $this->query("INSERT INTO tokens(token, user) VALUES(?, ?)", array(
            $token,
            $user['id']
        ));
        if ($id) {
            return $token;
        } else {
            return null;
        }
    }
}

error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE);
ini_set('display_errors', 'On');
require_once("json-rpc.php");

$service = new Service("notes.db", "config.json");
handle_json_rpc($service);
echo "\n";
