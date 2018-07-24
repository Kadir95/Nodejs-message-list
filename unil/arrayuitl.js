var containsperson = function (array, person) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].email == person.email) {
            return true;
        }
    }
    return false;
}  
module.exports.containsperson = containsperson;