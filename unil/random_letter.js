const letter_array = ['A','B','C','D','E','F','G','H','I','J','K'];

module.exports = function (size) {
    var sizeint = parseInt(size);
    let result = '';
    if (sizeint) {
        for (var i = 0; i < sizeint; i++) {
            result += choose(letter_array);
        }
    }
    return result;
}

function choose(choices) {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
}