// Feed.jsx
import { useState, useEffect } from 'react';
import { Box, Card, CardContent, CardActions, Typography, IconButton, Avatar } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { fetchPosts, voteOnPost } from '../components/feedBlockInter/blockchainService';
const Feed = ({ username }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      const result = await fetchPosts();
      setPosts(result);
      setLoading(false);
    };
    loadPosts();
  }, []);

  const handleVote = async (author, permlink) => {
    voteOnPost(username, author, permlink, () => {
      fetchPosts().then(setPosts);
    });
  };

  if (loading) {
    return <Typography>Loading posts...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      {posts.map((post) => (
        <Card key={`${post.author}-${post.permlink}`} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={`https://images.hive.blog/u/${post.author}/avatar`}
                alt={post.author}
                sx={{ mr: 2 }}
              />
              <Box>
                <Typography variant="subtitle1">
                  {post.author}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {formatDistanceToNow(new Date(post.created), { addSuffix: true })}
                </Typography>
              </Box>
            </Box>
            <Typography variant="h6" gutterBottom>
              {post.title}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <ReactMarkdown>{post.body.slice(0, 300)}...</ReactMarkdown>
            </Box>
          </CardContent>
          <CardActions>
            <IconButton onClick={() => handleVote(post.author, post.permlink)} color="primary">
              <ThumbsUp size={20} />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {post.net_votes}
            </Typography>
            <IconButton color="primary">
              <MessageCircle size={20} />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {post.children}
            </Typography>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
};

export default Feed;
