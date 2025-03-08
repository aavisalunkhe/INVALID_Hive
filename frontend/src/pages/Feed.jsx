import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Divider,
  Menu,
  MenuItem
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';

const Feed = ({ username, saveToBlockchain }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createPostDialog, setCreatePostDialog] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('post'); // 'post', 'deep_work', 'collaboration'
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  // Fetch posts from blockchain
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // TODO: Implement actual blockchain fetch
      // For now using mock data
      const mockPosts = [
        {
          id: 1,
          author: 'writer1',
          content: 'Just completed a deep work session! 1000 words in 25 minutes.',
          type: 'deep_work',
          timestamp: Date.now(),
          votes: 5,
          hasVoted: false
        },
        {
          id: 2,
          author: 'writer2',
          content: 'Looking for collaborators on a new fantasy story!',
          type: 'post',
          timestamp: Date.now() - 3600000,
          votes: 3,
          hasVoted: true
        }
      ];
      setPosts(mockPosts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    try {
      const postData = {
        content: newPost,
        type: postType,
        timestamp: Date.now()
      };

      await saveToBlockchain(postData, postData.content.substring(0, 50));
      
      // Add new post to local state
      setPosts(prev => [{
        id: Date.now(),
        author: username,
        ...postData,
        votes: 0,
        hasVoted: false
      }, ...prev]);

      setNewPost('');
      setCreatePostDialog(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleVote = async (postId) => {
    try {
      await saveToBlockchain({
        postId,
        action: 'vote'
      }, 'vote_post');

      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            votes: post.hasVoted ? post.votes - 1 : post.votes + 1,
            hasVoted: !post.hasVoted
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handlePostMenu = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };

  const getPostTypeChip = (type) => {
    const types = {
      deep_work: { label: 'Deep Work', color: 'primary' },
      collaboration: { label: 'Collaboration', color: 'secondary' },
      post: { label: 'Post', color: 'default' }
    };
    return types[type] || types.post;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Feed</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreatePostDialog(true)}
        >
          Create Post
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {posts.map(post => (
            <Card key={post.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar>{post.author[0].toUpperCase()}</Avatar>
                    <Typography variant="subtitle1">{post.author}</Typography>
                    <Chip 
                      size="small"
                      {...getPostTypeChip(post.type)}
                    />
                  </Box>
                  <IconButton onClick={(e) => handlePostMenu(e, post)}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Typography variant="body1">{post.content}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {new Date(post.timestamp).toLocaleString()}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton 
                  onClick={() => handleVote(post.id)}
                  color={post.hasVoted ? 'primary' : 'default'}
                >
                  <ThumbUpIcon />
                </IconButton>
                <Typography>{post.votes}</Typography>
                <IconButton>
                  <ShareIcon />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* Create Post Dialog */}
      <Dialog 
        open={createPostDialog} 
        onClose={() => setCreatePostDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create Post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Post Type:</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {['post', 'deep_work', 'collaboration'].map(type => (
                <Chip
                  key={type}
                  label={getPostTypeChip(type).label}
                  onClick={() => setPostType(type)}
                  color={postType === type ? 'primary' : 'default'}
                  clickable
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreatePostDialog(false)}>Cancel</Button>
          <Button onClick={handleCreatePost} variant="contained">Post</Button>
        </DialogActions>
      </Dialog>

      {/* Post Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Share</MenuItem>
        {selectedPost?.author === username && (
          <MenuItem onClick={handleMenuClose}>Delete</MenuItem>
        )}
      </Menu>
    </Container>
  );
};

export default Feed;
