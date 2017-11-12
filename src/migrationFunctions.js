export function enclosureDbAttachmentRemoval(encDb) {
  return encDb.allDocs({include_docs: true}).then(docs => {
    return Promise.all(docs.rows.map(doc => {
      if (doc.doc._attachments) {
        return Promise.all(Object.keys(doc.doc._attachments).map(att => {
          encDb.removeAttachment(doc.doc._id, att, doc.doc._rev);
        }));
      }
    }));
  }).then(() => {
    return encDb.compact();
  }).catch(err => {
    console.log(err);
  });
}
