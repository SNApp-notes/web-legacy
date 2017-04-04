var config = {};
if (process.env.NODE_ENV == 'production') {
    config.rpc = '/rpc.php';
} else {
    config.rpc = 'http://localhost/projects/jcubic/notes/rpc.php';
}
export default config;
