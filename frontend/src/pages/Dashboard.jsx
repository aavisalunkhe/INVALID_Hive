import React, { useState, useEffect } from 'react';
import { Client } from '@hiveio/dhive';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EditIcon from '@mui/icons-material/Edit';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = ({ username }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWords: 0,
    totalSessions: 0,
    totalCollabs: 0,
    averageWordsPerSession: 0,
    streak: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [weeklyGoal, setWeeklyGoal] = useState({
    target: 5000,
    current: 0
  });

  const client = new Client(['https://api.hive.blog']);

  useEffect(() => {
    fetchUserData();
  }, [username]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const query = {
        select_authors: [username],
        limit: 100,
        tag: 'cleanTxt',
        truncate_body: false
      };

      // First try to get user's blog posts
      const discussions = await client.database.getDiscussions('blog', {
        tag: username,
        limit: 100,
        truncate_body: false
      });

      // Then get any posts they've interacted with
      const activityQuery = {
        tag: 'cleanTxt',
        limit: 100,
        truncate_body: false
      };
      const communityActivity = await client.database.getDiscussions('trending', activityQuery);

      // Combine and filter the posts
      const allPosts = [...discussions, ...communityActivity];
      const cleanTxtPosts = allPosts.filter(post => {
        try {
          const metadata = JSON.parse(post.json_metadata);
          return metadata.app === 'cleanTxt' && 
                 (post.author === username || post.active_votes.some(vote => vote.voter === username));
        } catch {
          return false;
        }
      });

      // Calculate stats
      let totalWords = 0;
      let totalSessions = 0;
      let totalCollabs = 0;
      const recentActivities = [];

      cleanTxtPosts.forEach(post => {
        try {
          const metadata = JSON.parse(post.json_metadata);
          
          if (metadata.type === 'completed_session' && post.author === username) {
            totalWords += metadata.content?.wordCount || 0;
            totalSessions++;
          } else if (metadata.type === 'collab_session') {
            if (post.author === username || metadata.content?.participants?.includes(username)) {
              totalCollabs++;
            }
          }

          recentActivities.push({
            id: post.id,
            type: metadata.type,
            title: metadata.content?.title || 'Untitled',
            wordCount: metadata.content?.wordCount,
            timestamp: post.created,
            genre: metadata.content?.genre,
            author: post.author,
            permlink: post.permlink
          });
        } catch (error) {
          console.error('Error processing post:', error);
        }
      });

      // Sort activities by date
      recentActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setStats({
        totalWords,
        totalSessions,
        totalCollabs,
        averageWordsPerSession: totalSessions ? Math.round(totalWords / totalSessions) : 0,
        streak: calculateStreak(recentActivities)
      });

      setRecentActivity(recentActivities.slice(0, 10));
      
      // Calculate weekly progress
      const weeklyWords = calculateWeeklyWords(recentActivities);
      setWeeklyGoal(prev => ({
        ...prev,
        current: weeklyWords
      }));

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (activities) => {
    let streak = 0;
    const today = new Date();
    const dates = new Set(
      activities.map(activity => 
        new Date(activity.timestamp).toLocaleDateString()
      )
    );

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      if (dates.has(date.toLocaleDateString())) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const calculateWeeklyWords = (activities) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return activities
      .filter(activity => new Date(activity.timestamp) > weekAgo)
      .reduce((sum, activity) => sum + (activity.wordCount || 0), 0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {username}!
        </Typography>

        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <EditIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {stats.totalWords.toLocaleString()}
                  </Typography>
                </Box>
                <Typography color="textSecondary" variant="body2">
                  Total Words Written
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <TimerIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {stats.totalSessions}
                  </Typography>
                </Box>
                <Typography color="textSecondary" variant="body2">
                  Writing Sessions
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <GroupsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {stats.totalCollabs}
                  </Typography>
                </Box>
                <Typography color="textSecondary" variant="body2">
                  Collaborations
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {stats.streak} days
                  </Typography>
                </Box>
                <Typography color="textSecondary" variant="body2">
                  Current Streak
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Weekly Progress */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Weekly Progress
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  {weeklyGoal.current.toLocaleString()} / {weeklyGoal.target.toLocaleString()} words
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(weeklyGoal.current / weeklyGoal.target) * 100}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12}>
            <Paper>
              <List>
                <ListItem>
                  <Typography variant="h6">Recent Activity</Typography>
                </ListItem>
                <Divider />
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemText
                        primary={activity.title}
                        secondary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="caption" color="textSecondary">
                              {formatDistanceToNow(new Date(activity.timestamp))} ago
                            </Typography>
                            {activity.wordCount && (
                              <Chip 
                                label={`${activity.wordCount} words`}
                                size="small"
                                color="primary"
                              />
                            )}
                            {activity.genre && (
                              <Chip 
                                label={activity.genre}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
