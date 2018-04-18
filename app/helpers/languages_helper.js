module.exports = {
    getlocale : function(req) {
        //return 'fr-FR';
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
    },
    wordlab : function(paragraph){
      if(typeof paragraph === "undefined"){ return ""; }
      var paragraph = paragraph.toLowerCase().split(' '),
          queryString = "",
          self = this;
      paragraph.forEach(function(word, index) {
          queryString+= self.syllab(word)
          if(index < paragraph.length -1){ queryString+= "-"; }
      });
      return queryString;
    },
    syllab : function (s) {
      var a = s.toLowerCase();
      // CHECK LES NOMS COMPOSES AVEC TRAIT D'function
      if(a.split('-').length > 0){
        var w=a.split("-"),
            m="";
        for(var i = 0; i<w.length; i++){
          (w[i].slice(-1) === "s")? w[i]=w[i].substring(0, w[i].length - 1) : w[i]=w[i];
          m+=w[i];
        }
        a=m;
      }
      (a.slice(-1) === "s")? a = a.substring(0, a.length - 1) : a=a;
      a=a.split('');

      var f = a.shift(),
           r = '',
           codes = {
               a: '', e: '', i: '', o: '', u: '',
               b: 1, f: 1, p: 1, v: 1,
               c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2,
               d: 3, t: 3,
               l: 4,
               m: 5, n: 5,
               r: 6
           };
       r = f +
           a
           .map(function (v, i, a) { return codes[v] })
           .filter(function (v, i, a) {
               return ((i === 0) ? v !== codes[f] : v !== a[i - 1]);
           })
           .join('');
       return (r + '000').slice(0, 4).toUpperCase();
  }
}
