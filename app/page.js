'use client'
import { useState, useEffect } from 'react'
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc } from "firebase/firestore";
import { Box, Modal, Typography, Stack, TextField, Button } from "@mui/material";
import { firestore } from "@/firebase";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');

  const updateInventory = async () => {
    try {
      const snapshot = query(collection(firestore, 'inventory'));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({
          name: doc.id,
          ...doc.data()
        });
      });
      setInventory(inventoryList);
    } catch (error) {
      console.error("Error updating inventory: ", error);
    }
  };

  const addItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1 });
      } else {
        await setDoc(docRef, { quantity: 1 });
      }

      await updateInventory();
    } catch (error) {
      console.error("Error adding item: ", error);
    }
  };

  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity - 1 });
        }
      }

      await updateInventory();
    } catch (error) {
      console.error("Error removing item: ", error);
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex"
      flexDirection="column"
      justifyContent="center" 
      alignItems="center"
      gap={2}
    >
      <Modal open={open} onClose={handleClose}>
        <Box 
          position="absolute" 
          top="50%" 
          left="50%" 
          transform="translate(-50%, -50%)" 
          bgcolor="background.paper" 
          boxShadow={24} 
          padding={2}
        >
          <Stack spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
              }}
            />
            <Button
              variant="outlined" 
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Box borders="1px solid #333">
        <Box 
          width="800px" 
          height="100px" 
          bgcolor="#ADD8E6"
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          border="1px solid #333"
        >
          <Typography variant="h2" color="#333">
            Inventory Items
          </Typography>
        </Box>
        
        <Box display="flex" justifyContent="center" width="100%" padding="10px">
          <Button 
          variant="contained" 
          onClick={() => {
            handleOpen();
          }}
          >
            Add New Item
          </Button>
        </Box>  
        <Stack width="800px" height="300px" spacing={2} overflow="auto">
          {inventory.map(({ name, quantity }) => (
            <Box 
              key={name} 
              width="100%" 
              minHeight="150px" 
              display="flex"
              alignItems="center" 
              justifyContent="space-between"
              bgColor="#f0f0f0"
              padding={5}
              border="1px solid #333" 
            >
              <Typography variant="h4" color="#333" textAlign="center">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="h4" color="#333" textAlign="center">
                {quantity}
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => {
                  removeItem(name);
                }}
              >
                Remove
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
