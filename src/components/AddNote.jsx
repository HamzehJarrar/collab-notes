// src/components/AddNote.jsx
// ─────────────────────────────────────────────────────────────
// Input area where the user types and submits a new note.
// Writes directly to Firestore — all other clients receive
// the new note instantly via their onSnapshot listener.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  Box, TextField, Button, Paper, CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

export default function AddNote({ userName }) {
  const [text, setText]       = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      // Each note document stored in Firestore "notes" collection
      await addDoc(collection(db, "notes"), {
        text:      trimmed,
        createdAt: serverTimestamp(),          // server-side UTC timestamp
        author:    userName || "Anonymous",
      });
      setText("");
    } catch (err) {
      console.error("Error adding note:", err);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter submits
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleAdd();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5, mb: 4,
        border: "1px solid", borderColor: "divider",
        borderRadius: 3,
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(10px)",
      }}
    >
      <TextField
        fullWidth multiline minRows={2} maxRows={6}
        placeholder="Write a new note… (Ctrl+Enter to submit)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        variant="outlined"
        sx={{
          mb: 1.5,
          "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 15 },
        }}
      />
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={loading || !text.trim()}
          startIcon={
            loading
              ? <CircularProgress size={16} color="inherit" />
              : <AddIcon />
          }
          sx={{
            borderRadius: 2, px: 3,
            textTransform: "none", fontWeight: 600, fontSize: 14,
          }}
        >
          {loading ? "Adding…" : "Add Note"}
        </Button>
      </Box>
    </Paper>
  );
}
