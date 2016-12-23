function(doc, req) {
  if ((doc.userName == req.query.userName) || (doc._id == "_design/type")) {
    return true
  }
}
