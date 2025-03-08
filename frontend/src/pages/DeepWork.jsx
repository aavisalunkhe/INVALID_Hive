import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Card,
  CardContent,
  Tabs,
  Tab
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';

const prompts = {
  fiction: [
    "Write a scene where a character discovers something hidden in an old house.",
    "Create a story beginning with: 'The door opened without anyone touching it.'",
    "Describe a reunion between two people who haven't seen each other in 20 years."
  ],
  poetry: [
    "Write a poem about the changing seasons without using the words 'spring', 'summer', 'fall', or 'winter'.",
    "Create a poem that uses water as a metaphor for emotions.",
    "Write a poem that begins and ends with the same line."
  ],
  screenwriting: [
    "Write a dialogue between two characters who are trapped in an elevator.",
    "Create an opening scene that immediately hooks the audience.",
    "Write a monologue for a character who has just made a life-changing decision."
  ]
};

const distractingSites = [
  "facebook.com",
  "twitter.com",
  "instagram.com",
  "youtube.com",
  "reddit.com",
  "tiktok.com"
];

const DeepWorkZone = ({ saveToBlockchain, username }) => {
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [timerDuration, setTimerDuration] = useState(25);
  const [genre, setGenre] = useState('fiction');
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [distractionShieldActive, setDistractionShieldActive] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(500); 
  const [dailyProgress, setDailyProgress] = useState(0);
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', severity: 'info' });
  const [viewMode, setViewMode] = useState(0); 
  const [isSaving, setIsSaving] = useState(false);
  const [weeklyProgress, setWeeklyProgress] = useState({
    daysCompleted: 0,
    totalWords: 0
  });
  const [yesterdayProgress, setYesterdayProgress] = useState({
    wordCount: 0,
    goalMet: false
  });

  //timer, save when session ends
  useEffect(() => {
    let interval = null;
    if (timerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timerRunning && timeRemaining === 0) {
      setTimerRunning(false);
      handleSessionEnd();
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeRemaining]);

  //count words
  useEffect(() => {
    const words = countWords(content);
    setWordCount(words);
  }, [content]);

  const countWords = (text) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (!selectedPrompt) {
      setShowPromptDialog(true);
      return;
    }
    
    setTimerRunning(true);
    if (distractingWebsitesExist()) {
      setDistractionShieldActive(true);
      //implementing distracttion- proof extension
      setNotification({
        show: true,
        message: 'Distraction shield activated. Focus mode enabled.',
        severity: 'info'
      });
    }
  };

  const pauseTimer = () => {
    setTimerRunning(false);
  };

  const resetTimer = () => {
    if (wordCount > 0) {
      handleSessionEnd();
    } else {
      setTimerRunning(false);
      setTimeRemaining(timerDuration * 60);
    }
  };

  //implementing distraction- proof extension
  const distractingWebsitesExist = () => {
    return true;
  };

  const handlePromptSelect = (promptText) => {
    setSelectedPrompt(promptText);
    setShowPromptDialog(false);
  };

  const handleTimerDurationChange = (mins) => {
    setTimerDuration(mins);
    setTimeRemaining(mins * 60);
  };

  const handleGenreChange = (event) => {
    setGenre(event.target.value);
    setSelectedPrompt('');
  };

  const handleGoalSave = () => {
    setShowGoalDialog(false);
    setNotification({
      show: true,
      message: `Daily goal set to ${dailyGoal} words.`,
      severity: 'success'
    });
  };

  const handleSessionEnd = async () => {
    if (wordCount === 0) {
      setNotification({
        show: true,
        message: 'No content to save',
        severity: 'warning'
      });
      return;
    }

    setIsSaving(true);
    try {
      await saveToBlockchain({
        content: content,
        wordCount: wordCount,
        genre: genre,
        prompt: selectedPrompt,
        duration: timerDuration,
        completedAt: new Date().toISOString()
      }, 'completed_session');

      // Update daily progress
      setDailyProgress(prev => prev + wordCount);

      setNotification({
        show: true,
        message: 'Session completed and saved successfully!',
        severity: 'success'
      });

      // Reset session
      setContent('');
      setWordCount(0);
      setTimeRemaining(timerDuration * 60);
      setTimerRunning(false);
      
      // Recalculate progress after session save
      calculateProgress();

    } catch (error) {
      setNotification({
        show: true,
        message: 'Error saving session to blockchain',
        severity: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const calculateProgress = useCallback(() => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      //Fetch actual data from blockchain, abhi mock data use kia hai!!!!!!!!!!!!!!!!!!!!
      setYesterdayProgress({
        wordCount: 0,
        goalMet: false
      });

      setWeeklyProgress({
        daysCompleted: 0,
        totalWords: 0
      });

    } catch (error) {
      console.error('Error calculating progress:', error);
    }
  }, []);

  useEffect(() => {
    calculateProgress();
  }, [calculateProgress]);

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          Deep Work Zone
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Focused writing, free from AI and distractions.
        </Typography>

        <Tabs value={viewMode} onChange={(e, newValue) => setViewMode(newValue)} centered sx={{ mb: 3 }}>
          <Tab label="Writing Sprint" />
          <Tab label="Progress" />
          <Tab label="Settings" />
        </Tabs>

        {/* enter writing mode*/}
        {viewMode === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h5">
                      {timerRunning ? "Writing in Progress" : "Ready to Write"}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                      {selectedPrompt || "Select a prompt to begin"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" display="flex" alignItems="center">
                      <TimerIcon sx={{ mr: 1 }} />
                      {formatTime(timeRemaining)}
                    </Typography>
                  </Box>
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={12}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing here..."
                  variant="outlined"
                  disabled={!timerRunning && timeRemaining !== timerDuration * 60}
                />

                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Box>
                    <Typography variant="body2">
                      Words: {wordCount} {dailyGoal > 0 && `/ Goal: ${dailyGoal}`}
                    </Typography>
                    <Typography variant="body2">
                      Daily Progress: {dailyProgress} words
                    </Typography>
                  </Box>
                  <Box>
                    {!timerRunning ? (
                      <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<PlayArrowIcon />}
                        onClick={startTimer}
                      >
                        Start
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="outlined" 
                          color="secondary" 
                          startIcon={<PauseIcon />}
                          onClick={pauseTimer}
                          sx={{ mr: 1 }}
                        >
                          Pause
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          startIcon={<StopIcon />}
                          onClick={resetTimer}
                        >
                          End
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Writing Sprint Setup
                </Typography>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Session Duration</InputLabel>
                  <Select
                    value={timerDuration}
                    onChange={(e) => handleTimerDurationChange(e.target.value)}
                    disabled={timerRunning}
                  >
                    <MenuItem value={25}>25 Minutes (Pomodoro)</MenuItem>
                    <MenuItem value={50}>50 Minutes (Deep Work)</MenuItem>
                    <MenuItem value={15}>15 Minutes (Quick Sprint)</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Writing Genre</InputLabel>
                  <Select
                    value={genre}
                    onChange={handleGenreChange}
                    disabled={timerRunning}
                  >
                    <MenuItem value="fiction">Fiction</MenuItem>
                    <MenuItem value="poetry">Poetry</MenuItem>
                    <MenuItem value="screenwriting">Screenwriting</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setShowPromptDialog(true)}
                  disabled={timerRunning}
                  sx={{ mb: 2 }}
                >
                  {selectedPrompt ? "Change Prompt" : "Select a Prompt"}
                </Button>

                {selectedPrompt && (
                  <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body2" color="textSecondary">
                      Current Prompt:
                    </Typography>
                    <Typography variant="body1">
                      {selectedPrompt}
                    </Typography>
                  </Paper>
                )}

                <Divider sx={{ my: 2 }} />

                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body1">
                    Distraction Shield
                  </Typography>
                  <Chip 
                    icon={distractionShieldActive ? <CheckCircleIcon /> : <BlockIcon />}
                    label={distractionShieldActive ? "Active" : "Inactive"}
                    color={distractionShieldActive ? "success" : "default"}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* progress mode*/}
        {viewMode === 1 && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">
                Progress Tracking
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />}
                onClick={() => setShowGoalDialog(true)}
              >
                Set Goal
              </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Daily Progress
              </Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress 
                  variant="determinate" 
                  value={dailyGoal > 0 ? Math.min((dailyProgress / dailyGoal) * 100, 100) : 0}
                  size={80}
                  thickness={4}
                  color={dailyProgress >= dailyGoal ? "success" : "primary"}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" component="div" color="text.secondary">
                    {dailyGoal > 0 ? `${Math.round((dailyProgress / dailyGoal) * 100)}%` : '-'}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {dailyProgress} / {dailyGoal} words
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Accountability Board
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">Today</Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      {dailyProgress >= dailyGoal ? 
                        <CheckCircleIcon color="success" sx={{ mr: 1 }} /> : 
                        <CancelIcon color="error" sx={{ mr: 1 }} />
                      }
                      <Typography>
                        {dailyProgress >= dailyGoal ? 
                          `Goal reached! (${dailyProgress}/${dailyGoal})` : 
                          `In progress (${dailyProgress}/${dailyGoal})`
                        }
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">Yesterday</Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      {yesterdayProgress.goalMet ? 
                        <CheckCircleIcon color="success" sx={{ mr: 1 }} /> : 
                        <CancelIcon color="error" sx={{ mr: 1 }} />
                      }
                      <Typography>
                        {yesterdayProgress.goalMet ? 
                          `Goal reached! (${yesterdayProgress.wordCount}/${dailyGoal})` : 
                          `Goal not met (${yesterdayProgress.wordCount}/${dailyGoal})`
                        }
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">This Week</Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <Typography>
                        {weeklyProgress.daysCompleted}/7 days completed
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary" mt={1}>
                      Total words: {weeklyProgress.totalWords}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/*settings*/}
        {viewMode === 2 && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Settings
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Distraction Shield
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                These websites will be blocked during writing sessions.
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {distractingSites.map((site) => (
                  <Chip 
                    key={site}
                    label={site}
                    onDelete={() => {/*extension implement later!!!!!!!!*/}}
                  />
                ))}
              </Box>
              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              >
                Add Website
              </Button>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Typography variant="h6" gutterBottom>
                Daily Writing Goal
              </Typography>
              <Typography variant="body1">
                Current goal: {dailyGoal} words
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
                onClick={() => setShowGoalDialog(true)}
              >
                Update Goal
              </Button>
            </Box>
          </Paper>
        )}

        {/*select prompt*/}
        <Dialog open={showPromptDialog} onClose={() => setShowPromptDialog(false)} maxWidth="md">
          <DialogTitle>Select a Writing Prompt</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" gutterBottom>
              {genre.charAt(0).toUpperCase() + genre.slice(1)} Prompts:
            </Typography>
            {prompts[genre].map((prompt, index) => (
              <Paper 
                key={index} 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  mb: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  bgcolor: selectedPrompt === prompt ? 'action.selected' : 'background.paper'
                }}
                onClick={() => handlePromptSelect(prompt)}
              >
                <Typography>{prompt}</Typography>
              </Paper>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPromptDialog(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/*set goal*/}
        <Dialog open={showGoalDialog} onClose={() => setShowGoalDialog(false)}>
          <DialogTitle>Set Daily Writing Goal</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Word Count Goal"
              type="number"
              fullWidth
              variant="outlined"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              inputProps={{ min: 0 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowGoalDialog(false)}>Cancel</Button>
            <Button onClick={handleGoalSave} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        {/*alert*/}
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

export default DeepWorkZone;