import { useState } from "react";
import { Container, Box, Typography, AppBar, Toolbar, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import AddNote from "./components/AddNote";
import NoteList from "./components/NoteList";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2563eb" },
    background: { default: "#f1f5f9", paper: "#ffffff" },
  },
  typography: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
  shape: { borderRadius: 12 },
});

export default function App() {
  // استرجاع الاسم من localStorage مباشرة بدون شاشات تسجيل دخول
  const [userName] = useState(localStorage.getItem("collab_notes_username") || "مستخدم");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
        <Toolbar>
          <EditNoteIcon sx={{ color: "primary.main", mr: 1 }} />
          <Typography variant="h6" fontWeight={700} color="text.primary">قائمتي</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ minHeight: "100vh", py: 5, background: "linear-gradient(135deg, #f1f5f9 0%, #e0e7ff 100%)" }}>
        <Container maxWidth="md">
          <AddNote userName={userName} />
          <NoteList />
        </Container>
      </Box>
    </ThemeProvider>
  );
}