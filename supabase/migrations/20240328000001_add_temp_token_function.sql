-- Create function to set temp_user_token
CREATE OR REPLACE FUNCTION set_temp_user_token(token UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.temp_user_token', token::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 