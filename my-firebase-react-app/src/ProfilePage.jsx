import React from "react";

function ProfilePage({ userName }) {
  return (
    <div>
      {/* Top-left corner branding */}
      <div style={{ position: "absolute", top: 10, left: 10 }}>
        <h1 style={{ margin: 0 }}>SoraSpeak</h1>
      </div>

      {/* Centered welcome text */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 100 }}>
        <h2>Welcome, {userName}!</h2>
      </div>
    </div>
  );
}

export default ProfilePage; 