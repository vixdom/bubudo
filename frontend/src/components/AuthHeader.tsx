import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Avatar, Box } from '@mui/material';
import { supabase } from '../services/supabaseClient';

interface UserInfo {
  id: string; // Supabase UUID
  email: string;
  avatar_url?: string;
  full_name?: string;
}

const AuthHeader: React.FC<{
  onAuthChange: (user: UserInfo | null) => void;
}> = ({ onAuthChange }) => {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    // Check for existing session
    const session = supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          avatar_url: session.user.user_metadata.avatar_url,
          full_name: session.user.user_metadata.full_name,
        });
        onAuthChange({
          id: session.user.id,
          email: session.user.email || '',
          avatar_url: session.user.user_metadata.avatar_url,
          full_name: session.user.user_metadata.full_name,
        });
      } else {
        setUser(null);
        onAuthChange(null);
      }
    });
    // Listen for login/logout
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          avatar_url: session.user.user_metadata.avatar_url,
          full_name: session.user.user_metadata.full_name,
        });
        onAuthChange({
          id: session.user.id,
          email: session.user.email || '',
          avatar_url: session.user.user_metadata.avatar_url,
          full_name: session.user.user_metadata.full_name,
        });
      } else {
        setUser(null);
        onAuthChange(null);
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [onAuthChange]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          AI Task Manager
        </Typography>
        {user ? (
          <Box display="flex" alignItems="center" gap={2}>
            {user.avatar_url && <Avatar src={user.avatar_url} alt={user.full_name} />}
            <Typography variant="body1">{user.full_name || user.email}</Typography>
            <Button variant="outlined" onClick={handleLogout} color="secondary">Logout</Button>
          </Box>
        ) : (
          <Button variant="contained" onClick={handleLogin} color="primary">Sign in with Google</Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AuthHeader;
