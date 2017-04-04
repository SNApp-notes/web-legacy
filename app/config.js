var config = {};

if (PRODUCTION) {
    config.rpc = 'rpc.php';
} else {
    config.rpc = 'http://localhost/projects/jcubic/notes/rpc.php';
}
export default config;
