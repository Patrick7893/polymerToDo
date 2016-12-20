function(doc, req) {
    return !!doc.userName && doc.userName == req.query.userName;
}
