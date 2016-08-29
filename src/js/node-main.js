/* Este código es rebuscado en joda, mis disculpas <3 */
function once(code, self) {
    var did_it_ran = false;
    return function() {
        if(did_it_ran) {
            return;
        }

        did_it_ran = true;

        return code.apply(self, arguments);
    }
}
exports.init = once(Function.call.call, Function.call);
