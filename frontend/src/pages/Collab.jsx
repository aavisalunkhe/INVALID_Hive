import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { io } from 'socket.io-client';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import EditIcon from '@mui/icons-material/Edit';
import { Client } from '@hiveio/dhive';

const SERVER_URL = "http://localhost:5000"; // WebSocket server URL

const Collab = ({ username, client }) => {
  const [user, setUser] = useState(Cookies.get('hiveUser') || null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    genre: '',
    maxParticipants: 2
  });
  const [editorContent, setEditorContent] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    severity: 'info'
  });

  const genres = [
    'Fiction',
    'Non-Fiction',
    'Poetry',
    'Science Fiction',
    'Fantasy',
    'Mystery',
    'Romance',
    'Horror',
    'Thriller',
    'Other'
  ];

  const socket = io(SERVER_URL, { query: { user: user || "guest" }, transports: ["websocket"] });

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const [activeSessions, newSessions] = await Promise.all([
        client.database.getDiscussions('trending', {
          tag: 'CleanTxt',
          limit: 50,
          truncate_body: false
        }),
        client.database.getDiscussions('created', {
          tag: 'CleanTxt',
          limit: 20,
          truncate_body: false
        })
      ]);

      const allSessions = [...newSessions, ...activeSessions];
      const uniqueSessions = Array.from(new Map(allSessions.map(session => [session.id, session])).values());

      const collabSessions = uniqueSessions
        .filter(session => {
          try {
            const metadata = JSON.parse(session.json_metadata);
            return metadata.app === 'CleanTxt' && metadata.type === 'collab_session';
          } catch {
            return false;
          }
        })
        .map(session => {
          const metadata = JSON.parse(session.json_metadata);
          const activeVotes = session.active_votes || [];
          
          return {
            id: `${session.author}-${session.permlink}`,
            author: session.author,
            title: metadata.content.title,
            description: metadata.content.description,
            genre: metadata.content.genre,
            maxParticipants: metadata.content.maxParticipants,
            currentParticipants: metadata.content.participants?.length || 1,
            participants: metadata.content.participants || [session.author],
            timestamp: new Date(session.created).toLocaleDateString(),
            permlink: session.permlink,
            netVotes: activeVotes.length,
            isActive: metadata.content.status === 'active',
            hasJoined: metadata.content.participants?.includes(username)
          };
        })
        .filter(session => session.isActive);

      setSessions(collabSessions.sort((a, b) => b.netVotes - a.netVotes));
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setNotification({
        show: true,
        message: 'Error fetching collaboration sessions',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();

    const stream = client.blockchain.getBlockStream();
    stream.on('data', (block) => {
      const hasCollabOp = block.transactions.some(tx => {
        return tx.operations.some(op => {
          if (op[0] === 'comment') {
            try {
              const metadata = JSON.parse(op[1].json_metadata);
              return metadata.app === 'CleanTxt' && metadata.type === 'collab_session';
            } catch {
              return false;
            }
          }
          return false;
        });
      });

      if (hasCollabOp) {
        fetchSessions();
      }
    });

    return () => stream.destroy();
  }, [client]);

  useEffect(() => {
    if (isLoggedIn) {
      socket.emit("join", user);
    }
  }, [isLoggedIn]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: " ",
    onUpdate: ({ editor }) => {
      if (socket && socket.connected) {
        const json = editor.getJSON();
        setEditorContent(json);
        socket.emit("send-changes", { user, content: json });
      }
    },
  });

  useEffect(() => {
    socket.on("receive-changes", (json) => {
      if (editor) editor.commands.setContent(json);
    });

    return () => socket.off("receive-changes");
  }, [editor]);

  const handleCreateSession = async () => {
    try {
      const permlink = new Date().toISOString().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const operations = [
        ['comment',
          {
            parent_author: '',
            parent_permlink: 'CleanTxt',
            author: username,
            permlink: permlink,
            title: newSession.title,
            body: newSession.description,
            json_metadata: JSON.stringify({
              app: 'CleanTxt',
              type: 'collab_session',
              content: {
                ...newSession,
                status: 'active',
                participants: [username],
                timestamp: new Date().toISOString()
              }
            })
          }
        ]
      ];

      await new Promise((resolve, reject) => {
        window.hive_keychain.requestBroadcast(
          username,
          operations,
          'posting',
          response => {
            if (response.success) {
              resolve(response);
            } else {
              reject(new Error(response.message));
            }
          }
        );
      });

      setShowNewSessionDialog(false);
      setNewSession({
        title: '',
        description: '',
        genre: '',
        maxParticipants: 2
      });
      fetchSessions();
      setNotification({
        show: true,
        message: 'Session created successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating session:', error);
      setNotification({
        show: true,
        message: 'Error creating session',
        severity: 'error'
      });
    }
  };

  const handleJoinSession = async (session) => {
    // TODO: Implement join session functionality
    console.log('Joining session:', session);
  };

  const saveToHive = () => {
    const jsonData = { username: user, content: editorContent };
    socket.emit("save-to-hive", jsonData);
    setNotification({
      show: true,
      message: 'Content saved to Hive!',
      severity: 'success'
    });
  };

  const handleLogin = () => {
    // Implement your login logic here
    const username = prompt("Enter your Hive Username: ");
    if (username) {
      Cookies.set('hiveUser', username);
      setUser(username);
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    Cookies.remove('hiveUser');
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4 }}>
        {!isLoggedIn ? (
          <Button variant="contained" onClick={handleLogin}>Login With Hive Keychain</Button>
        ) : (
          <Box>
            <Typography variant="h6">Logged in as {user}</Typography>
            <Button variant="outlined" onClick={handleLogout}>Logout</Button>
            
            <Typography variant="h4" sx={{ mt: 2 }}>Collaborative Writing</Typography>
            <EditorContent editor={editor} />
            <Button variant="contained" onClick={saveToHive} sx={{ mt: 2 }}>Save to Hive</Button>
          </Box>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            Collaborative Writing
          </Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setShowNewSessionDialog(true)}
          >
            New Session
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {sessions.map((session) => (
              <Grid item xs={12} md={6} key={session.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {session.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {session.description}
                    </Typography>
                    <Box display="flex" gap={1} mb={2}>
                      <Chip label={session.genre} color="primary" size="small" />
                      <Chip 
                        label={`${session.currentParticipants}/${session.maxParticipants} writers`}
                        icon={<GroupsIcon />}
                        size="small"
                      />
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      Created by @{session.author} • {session.timestamp}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      variant="contained"
                      disabled={session.currentParticipants >= session.maxParticipants}
                      onClick={() => handleJoinSession(session)}
                    >
                      Join Session
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog 
          open={showNewSessionDialog} 
          onClose={() => setShowNewSessionDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New Collaboration Session</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Title"
                value={newSession.title}
                onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newSession.description}
                onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
              />
              <FormControl fullWidth>
                <InputLabel>Genre</InputLabel>
                <Select
                  value={newSession.genre}
                  label="Genre"
                  onChange={(e) => setNewSession(prev => ({ ...prev, genre: e.target.value }))}
                >
                  {genres.map((genre) => (
                    <MenuItem key={genre} value={genre}>{genre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Max Participants</InputLabel>
                <Select
                  value={newSession.maxParticipants}
                  label="Max Participants"
                  onChange={(e) => setNewSession(prev => ({ ...prev, maxParticipants: e.target.value }))}
                >
                  {[2, 3, 4, 5].map((num) => (
                    <MenuItem key={num} value={num}>{num} writers</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowNewSessionDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateSession}
              variant="contained"
              disabled={!newSession.title || !newSession.description || !newSession.genre}
            >
              Create Session
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={notification.show}
          autoHideDuration={6000}
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        >
          <Alert 
            onClose={() => setNotification(prev => ({ ...prev, show: false }))} 
            severity={notification.severity}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default Collab;
