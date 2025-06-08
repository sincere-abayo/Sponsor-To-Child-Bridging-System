import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  Box,
} from '@mui/material';

const Messages = () => {
  const [messages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // TODO: Implement message sending
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '70vh', overflow: 'auto' }}>
            <List>
              {messages.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary="No messages"
                    secondary="Start a conversation"
                  />
                </ListItem>
              ) : (
                messages.map((message) => (
                  <ListItem
                    key={message.id}
                    button
                    selected={selectedMessage?.id === message.id}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <ListItemAvatar>
                      <Avatar src={message.avatar} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={message.sender}
                      secondary={message.preview}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            {selectedMessage ? (
              <>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6">{selectedMessage.sender}</Typography>
                </Box>
                
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                  {/* Message history will go here */}
                </Box>
                
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <form onSubmit={handleSendMessage}>
                    <Grid container spacing={2}>
                      <Grid item xs>
                        <TextField
                          fullWidth
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                        />
                      </Grid>
                      <Grid item>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={!newMessage.trim()}
                        >
                          Send
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Select a conversation to start messaging
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Messages; 