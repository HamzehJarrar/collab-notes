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
      // نستخدم Date.now() كقيمة مبدئية للترتيب لضمان ظهورها في الأسفل
      await addDoc(collection(db, "notes"), {
        text:      trimmed,
        createdAt: serverTimestamp(),
        author:    userName || "Anonymous",
        order:     Date.now(), // حل مشكلة ReferenceError هنا
      });
      setText("");
    } catch (err) {
      console.error("Error adding note:", err);
    } finally {
      setLoading(false);
    }
  };

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
        placeholder="اكتب ملاحظة جديدة... (Ctrl+Enter للحفظ)"
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
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
          sx={{ borderRadius: 2, px: 3, textTransform: "none", fontWeight: 600 }}
        >
          {loading ? "جاري الإضافة..." : "إضافة للمهمات"}
        </Button>
      </Box>
    </Paper>
  );
}