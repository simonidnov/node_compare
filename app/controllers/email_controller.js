const Email_model = require('../models/emails_model'),
      auth_helper     = require('../helpers/auth_helper');

exports.send = function(req, datas, callback) {
    Email_model.send(req, datas, callback);
};
exports.validate_account = function(req, datas, callback) {
    datas.to = datas.email;
    datas.subject = "Valider mon compte IDKIDS APP";
    datas.title = "Mon compte idkids";
    datas.message = "Pour plus de sécurité, nous vous conseillons de valider votre compte IDKIDS.community.<br/>Cliquez sur le lien ci-dessous pour confirmer votre inscription et valider votre compte";
    datas.url = "http://www.idkids-app.com/validation/account/"+datas.email+"/"+datas.validation_code;
    datas.content = 'Bonjour '+datas.pseudo+' note avatar ::: '+datas.avatar+' pour valider votre compte, veuillez cliquer sur le liens ci-dessous : <a href="'+datas.url+'">VALIDER MON COMTPE</a>';
    Email_model.send("emails/validation_code", req.body.user_id, datas, callback);
};
exports.lost_password = function(req, datas, callback) {
    datas.to = datas.email;
    datas.subject = "Mot de passe perdu IDKIDS APP";
    datas.title = "Mon compte idkids";
    datas.message = "Vous avez effectué une demande de mot de passe,<br/>pour réinitialiser votre mot de passe, cliquez sur le liens ci-desosus.";
    datas.url = "http://www.idkids-app.com/auth/update_password/"+datas.email+"/"+datas.validation_code;
    datas.content = 'Bonjour '+datas.pseudo+' pour valider votre compte, veuillez cliquer sur le liens ci-dessous : <a href="'+datas.url+'">VALIDER MON COMTPE</a>';
    Email_model.send("emails/lost_password", req.body.user_id, datas, callback);
};
