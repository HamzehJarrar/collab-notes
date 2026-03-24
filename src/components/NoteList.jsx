// src/components/NoteList.jsx
// ─────────────────────────────────────────────────────────────
// Subscribes to the Firestore "notes" collection using
// onSnapshot — this is the real-time listener that pushes
// every add / edit / delete to ALL connected clients instantly.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import {
  Box, Typography, CircularProgress, Divider,
} from "@mui/material";
import NotesIcon from "@mui/icons-material/Notes";
import {
  collection, query, orderBy, onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/config";
import NoteItem from "./NoteItem";

export default function NoteList() {
  const [notes, setNotes]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Build query: all notes, newest first
    const q = query(
      collection(db, "notes"),
      orderBy("createdAt", "desc")   // most recent note at the top
    );

    // onSnapshot fires immediately with current data, then again
    // on every change (add / update / delete) in Firestore.
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,       // Firestore auto-generated document ID
        ...doc.data(),    // { text, createdAt, author }
      }));
      setNotes(fetched);
      setLoading(false);
    }, (err) => {
      console.error("Firestore listener error:", err);
      setLoading(false);
    });

    // Cleanup: stop listening when component unmounts
    return () => unsubscribe();
  }, []);

  // ── Loading skeleton ──────────────────────────────────────
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={8}>
        <CircularProgress size={32} thickness={3} />
        <Typography variant="body2" color="text.secondary" ml={2}>
          Loading notes…
        </Typography>
      </Box>
    );
  }

  // ── Empty state ───────────────────────────────────────────
  if (notes.length === 0) {
    return (
      <Box
        display="flex" flexDirection="column"
        alignItems="center" justifyContent="center" py={10}
        color="text.disabled"
      >
        <NotesIcon sx={{ fontSize: 56, mb: 2, opacity: 0.4 }} />
        <Typography variant="h6" fontWeight={500}>No notes yet</Typography>
        <Typography variant="body2" mt={0.5}>
          Be the first to add one above!
        </Typography>
      </Box>
    );
  }

  // ── Notes list ────────────────────────────────────────────
  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
          {notes.length} {notes.length === 1 ? "note" : "notes"}
        </Typography>
        <Box
          component="span"
          sx={{
            display: "inline-flex", alignItems: "center", gap: 0.5,
            ml: "auto", fontSize: 11, color: "success.main", fontWeight: 600,
          }}
        >
          <Box
            sx={{
              width: 7, height: 7, borderRadius: "50%",
              bgcolor: "success.main",
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%,100%": { opacity: 1 }, "50%": { opacity: 0.4 },
              },
            }}
          />
          Live sync on
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box display="flex" flexDirection="column" gap={2}>
        {notes.map((note) => (
          <NoteItem key={note.id} note={note} />
        ))}
      </Box>
    </Box>
  );
}
