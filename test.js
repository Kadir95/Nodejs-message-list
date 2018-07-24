var foo = function (callback) {
    return callback();
}

console.log('Hello ' + foo(() => {
    return 'Kadir'
}));