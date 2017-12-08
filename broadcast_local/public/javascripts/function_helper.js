if (typeof Object.keys !== "function") {
    (function() {
        var hasOwn = Object.prototype.hasOwnProperty;
        Object.keys = Object_keys;
        function Object_keys(obj) {
            var keys = [], name;
            for (name in obj) {
                if (hasOwn.call(obj, name)) {
                    keys.push(name);
                }
            }
            return keys;
        }
    })();
}
if( typeof parseDate === "undefined"){
    function parseDate(dateString){
        return new Date(dateString).getDate()+"/"+new Date(dateString).getMonth()+"/"+new Date(dateString).getFullYear();
    }
}