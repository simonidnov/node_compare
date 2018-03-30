module.exports = {
    getlocale:function() {
        return 'fr-FR';
        switch(req.headers["accept-language"]){
          case 'fr-FR':
            return 'fr-FR';
            break;
          case 'en-EN':
            return 'en-EN';
            break;
          default:
            return 'fr-FR';
            break;
        }
    }
}
