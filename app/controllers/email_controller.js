const Email_model = require('../models/emails_model'),
      auth_helper     = require('../helpers/auth_helper');

exports.get = function(req, res, callback) {
    Email_model.get(req, res, callback);
};
exports.send = function(template, datas, callback) {
    if(template === null){
      template = "emails/default";
    }
    Email_model.send(template, null, datas, callback);
};
exports.validate_account = function(req, datas, callback) {
    datas.to = datas.email;
    datas.subject = "Valider mon compte";
    datas.title = "Mon compte "+app.locals.settings.label;
    datas.message = "Pour plus de sécurité, nous vous conseillons de valider votre compte.<br/>Cliquez sur le lien ci-dessous pour confirmer votre inscription et valider votre compte";
    datas.url = app.locals.settings.host+"/validation/account/"+datas.email+"/"+datas.validation_code;
    datas.content = 'Bonjour '+datas.pseudo+' note avatar ::: '+datas.avatar+' pour valider votre compte, veuillez cliquer sur le liens ci-dessous : <a href="'+datas.url+'">VALIDER MON COMTPE</a>';
    Email_model.send("emails/validation_code", req.body.user_id, datas, callback);
};
exports.lost_password = function(req, datas, callback) {
    datas.to = datas.email;
    datas.subject = "Mot de passe perdu";
    datas.title = "Mon compte "+app.locals.settings.label;
    datas.message = "Vous avez effectué une demande de mot de passe,<br/>pour réinitialiser votre mot de passe, cliquez sur le liens ci-desosus.";
    datas.url = app.locals.settings.host+"/auth/update_password/"+datas.email+"/"+datas.validation_code;
    datas.content = 'Bonjour '+datas.pseudo+' pour valider votre compte, veuillez cliquer sur le liens ci-dessous : <a href="'+datas.url+'">VALIDER MON COMTPE</a>';
    Email_model.send("emails/lost_password", req.body.user_id, datas, callback);
};

exports.sendMaChansonEcard = function(req, datas, callback) {
    Email_model.send("emails/machansondanniversaire", req, datas, callback);
}
