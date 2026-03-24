import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Divider } from "@mui/material";
import NotesIcon from "@mui/icons-material/Notes";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase/config";
import NoteItem from "./NoteItem";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function NoteList() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // الترتيب الآن يعتمد على حقل order بدلاً من createdAt
    const q = query(collection(db, "notes"), orderBy("order", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotes(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(notes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // تحديث الحالة محلياً فوراً لتجربة مستخدم سلسة
    setNotes(items);

    // تحديث الترتيب في Firestore باستخدام Batch
    const batch = writeBatch(db);
    items.forEach((note, index) => {
      const noteRef = doc(db, "notes", note.id);
      batch.update(noteRef, { order: index });
    });
    
    try {
      await batch.commit();
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" py={8}>
      <CircularProgress size={32} />
    </Box>
  );

  return (
    <Box>
      

      <Divider sx={{ mb: 2 }} />

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="notes-list">
          {(provided) => (
            <Box {...provided.droppableProps} ref={provided.innerRef} display="flex" flexDirection="column" gap={2}>
              {notes.map((note, index) => (
                <Draggable key={note.id} draggableId={note.id} index={index}>
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <NoteItem note={note} />
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
}