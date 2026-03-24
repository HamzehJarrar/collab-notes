// src/App.jsx
// ─────────────────────────────────────────────────────────────
// Main entry point.
// • Signs the user in anonymously (Firebase Auth) so every note
//   has an author name.
// • Lets the user set a display name stored in localStorage.
// • Renders <AddNote> and <NoteList>.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  Container, Box, Typography, AppBar, Toolbar,
  TextField, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, CssBaseline,
  ThemeProvider, createTheme, Chip,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import PersonIcon   from "@mui/icons-material/Person";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";
import AddNote  from "./components/AddNote";
import NoteList from "./components/NoteList";

// ── MUI Theme ──────────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: "light",
    primary:    { main: "#2563eb" },
    secondary:  { main: "#7c3aed" },
    background: { default: "#f1f5f9", paper: "#ffffff" },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard:   { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiPaper:  { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiButton: { styleOverrides: { root: { boxShadow: "none", "&:hover": { boxShadow: "none" } } } },
  },
});

// ── Helpers ────────────────────────────────────────────────
const STORAGE_KEY = "collab_notes_username";

function getStoredName() {
  return localStorage.getItem(STORAGE_KEY) || "";
}

function storeName(name) {
  localStorage.setItem(STORAGE_KEY, name);
}

// ── App ────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]           = useState(null);          // Firebase user
  const [userName, setUserName]   = useState(getStoredName()); // display name
  const [nameDialog, setNameDialog] = useState(false);        // name-picker dialog
  const [tempName, setTempName]   = useState("");

  // Sign in anonymously on mount
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        // Not signed in — trigger anonymous sign-in
        signInAnonymously(auth).catch(console.error);
      }
    });
    return () => unsub();
  }, []);

  // Prompt for a name if none is stored
  useEffect(() => {
    if (user && !getStoredName()) {
      setNameDialog(true);
    }
  }, [user]);

  const handleSaveName = () => {
    const name = tempName.trim() || "Anonymous";
    setUserName(name);
    storeName(name);
    setNameDialog(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* ── Top bar ── */}
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
        <Toolbar sx={{ gap: 2 }}>
          <EditNoteIcon sx={{ color: "primary.main", fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ flexGrow: 1, letterSpacing: "-0.3px" }}>
            Collab Notes
          </Typography>

          {/* Current user chip */}
          {userName && (
            <Chip
              icon={<PersonIcon />}
              label={userName}
              size="small"
              variant="outlined"
              onClick={() => { setTempName(userName); setNameDialog(true); }}
              sx={{ cursor: "pointer", fontSize: 12 }}
            />
          )}
        </Toolbar>
      </AppBar>

      {/* ── Main content ── */}
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          background: "linear-gradient(135deg, #f1f5f9 0%, #e0e7ff 100%)",
          py: 5,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h4" fontWeight={800} mb={0.5}
            sx={{ letterSpacing: "-0.5px" }}
          >
            Shared Notes
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>
            Everyone sees changes in real-time. Start typing!
          </Typography>

          {/* Add Note — only renders once user is authenticated */}
          {user && <AddNote userName={userName} />}

          {/* Real-time note list */}
          <NoteList />
        </Container>
      </Box>

      {/* ── Name dialog ── */}
      <Dialog
        open={nameDialog}
        onClose={() => setNameDialog(false)}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={700}>What's your name?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Your name will appear next to the notes you write.
          </Typography>
          <TextField
            autoFocus fullWidth
            placeholder="e.g. Ahmed"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            variant="outlined"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { storeName("Anonymous"); setUserName("Anonymous"); setNameDialog(false); }}>
            Skip
          </Button>
          <Button variant="contained" onClick={handleSaveName} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
