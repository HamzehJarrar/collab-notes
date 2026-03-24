// src/components/NoteItem.jsx
// ─────────────────────────────────────────────────────────────
// Renders a single note card with inline edit and delete.
// All writes go directly to Firestore; onSnapshot in NoteList
// picks them up and re-renders automatically everywhere.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  Card, CardContent, CardActions,
  Typography, IconButton, TextField, Box,
  Tooltip, Chip, CircularProgress,
} from "@mui/material";
import EditIcon     from "@mui/icons-material/Edit";
import DeleteIcon   from "@mui/icons-material/Delete";
import CheckIcon    from "@mui/icons-material/Check";
import CloseIcon    from "@mui/icons-material/Close";
import PersonIcon   from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/config";

// Convert Firestore Timestamp → human-readable string
function formatDate(timestamp) {
  if (!timestamp) return "just now";
  const date = timestamp.toDate();
  return date.toLocaleString(undefined, {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function NoteItem({ note }) {
  const [editing, setEditing]   = useState(false);
  const [editText, setEditText] = useState(note.text);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Save edited text ──────────────────────────────────────
  const handleSave = async () => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === note.text) { setEditing(false); return; }

    setSaving(true);
    try {
      await updateDoc(doc(db, "notes", note.id), { text: trimmed });
      setEditing(false);
    } catch (err) {
      console.error("Error updating note:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditText(note.text);
    setEditing(false);
  };

  // ── Delete note ───────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "notes", note.id));
    } catch (err) {
      console.error("Error deleting note:", err);
      setDeleting(false);
    }
    // If successful the card disappears via onSnapshot — no need to setDeleting(false)
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        transition: "box-shadow 0.2s, transform 0.2s",
        opacity: deleting ? 0.5 : 1,
        "&:hover": {
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        {editing ? (
          /* ── Edit mode ── */
          <TextField
            fullWidth multiline minRows={2} autoFocus
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            variant="outlined"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 15 } }}
          />
        ) : (
          /* ── Display mode ── */
          <Typography
            variant="body1"
            sx={{ fontSize: 15, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {note.text}
          </Typography>
        )}

        {/* Author + timestamp row */}
        <Box display="flex" alignItems="center" gap={1} mt={1.5} flexWrap="wrap">
          <Chip
            icon={<PersonIcon sx={{ fontSize: "14px !important" }} />}
            label={note.author || "Anonymous"}
            size="small"
            variant="outlined"
            sx={{ fontSize: 11, height: 22, borderRadius: 1 }}
          />
          <Box display="flex" alignItems="center" gap={0.4} color="text.secondary">
            <AccessTimeIcon sx={{ fontSize: 13 }} />
            <Typography variant="caption" sx={{ fontSize: 11 }}>
              {formatDate(note.createdAt)}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 1.5, pt: 0, justifyContent: "flex-end" }}>
        {editing ? (
          <>
            <Tooltip title="Save (Ctrl+Enter)">
              <span>
                <IconButton
                  size="small" color="primary"
                  onClick={handleSave}
                  disabled={saving || !editText.trim()}
                >
                  {saving ? <CircularProgress size={16} /> : <CheckIcon fontSize="small" />}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Cancel (Esc)">
              <IconButton size="small" onClick={handleCancel}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => setEditing(true)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <span>
                <IconButton
                  size="small" color="error"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting
                    ? <CircularProgress size={16} color="error" />
                    : <DeleteIcon fontSize="small" />
                  }
                </IconButton>
              </span>
            </Tooltip>
          </>
        )}
      </CardActions>
    </Card>
  );
}
