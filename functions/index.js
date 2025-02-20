const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
admin.initializeApp();

// v1 trigger removed, will add v2 trigger in next step

exports.onVideoDocCreate = onDocumentCreated(
    "videos/{docId}",
    async (event) => {
      const snap = event.data;
      const data = snap.data();
      console.log("New video doc created:", data);

      try {
        await snap.ref.update({
          status: "function_detected",
          functionTriggeredAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log("Document status updated successfully");
      } catch (error) {
        console.error("Error updating document:", error);
      }
    },
);
