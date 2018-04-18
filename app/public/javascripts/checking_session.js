var user_local = window.localStorage.getItem('idkids_local_user');
if(typeof user_local !== "undefined" && user_local !== null && user_local !== ""){
  user_local = JSON.parse(user_local);
  window.location.href = "/checking_session?_id="+user_local._id+"&token="+user_local.token+"&secret="+user_local.secret;
}else{
  window.location.href = "/auth";
}
