import { FormEvent, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { signUp } from "../../redux/thunkActions";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Tooltip,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Link } from "react-router-dom";
import InfoIcon from '@mui/icons-material/Info';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import InputMask from 'react-input-mask';

export default function SignUp() {
  const dispatch = useAppDispatch();
  const { error, status } = useAppSelector((state) => state.auth);
  
  const [surname, setSurname] = useState('');
  const [name, setName] = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [phone, setPhone] = useState('+7 ');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'owner'>('user');

  const [surnameError, setSurnameError] = useState('');
  const [nameError, setNameError] = useState('');
  const [patronymicError, setPatronymicError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateName = (value: string, fieldName: string) => {
    if (value && value.length < 2) {
      return `${fieldName} должно содержать минимум 2 буквы`;
    }
    if (value && !/^[а-яА-ЯёЁa-zA-Z]+$/.test(value)) {
      return `${fieldName} должно содержать только буквы`;
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Пароль должен содержать минимум 8 символов';
    }
    return '';
  };

  const validateEmail = (email: string) => {
    if (!email.includes('@') || !email.includes('.')) {
      return 'Некорректный email адрес';
    }
    return '';
  };

  const handleSurnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSurname(value);
    setSurnameError(validateName(value, 'Фамилия'));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setNameError(validateName(value, 'Имя'));
  };

  const handlePatronymicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPatronymic(value);
    setPatronymicError(value ? validateName(value, 'Отчество') : '');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    setPhoneError(value.includes('_') ? 'Введите полный номер телефона' : '');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
    if (confirmPassword) {
      setConfirmPasswordError(value !== confirmPassword ? 'Пароли не совпадают' : '');
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setConfirmPasswordError(value !== password ? 'Пароли не совпадают' : '');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanedPhone = phone.replace(/\D/g, '');

    if (!cleanedPhone || phoneError || surnameError || nameError || patronymicError || 
        emailError || passwordError || confirmPasswordError) {
      return;
    }

    await dispatch(
      signUp({
        name,
        surname,
        patronymic,
        phone: Number(cleanedPhone),
        email,
        password,
        role,
      })
    );
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        width="100%"
      >
        <Typography component="h1" variant="h5">
          Регистрация
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 3, width: "100%" }}
        >
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                required
                fullWidth
                value={surname}
                onChange={handleSurnameChange}
                label="Фамилия"
                error={!!surnameError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Tooltip title="Фамилия должна содержать минимум 2 буквы и только буквы" arrow>
                        <InfoIcon sx={{ fontSize: '20px', color: 'action.active', cursor: 'help' }} />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                required
                fullWidth
                value={name}
                onChange={handleNameChange}
                label="Имя"
                error={!!nameError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Tooltip title="Имя должно содержать минимум 2 буквы и только буквы" arrow>
                        <InfoIcon sx={{ fontSize: '20px', color: 'action.active', cursor: 'help' }} />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                fullWidth
                value={patronymic}
                onChange={handlePatronymicChange}
                label="Отчество"
                error={!!patronymicError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Tooltip title="Отчество должно содержать только буквы" arrow>
                        <InfoIcon sx={{ fontSize: '20px', color: 'action.active', cursor: 'help' }} />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InputMask
                mask="+7 999 999 99 99"
                value={phone}
                onChange={handlePhoneChange}
                maskChar="_"
              >
                {(inputProps) => (
                  <TextField
                    {...inputProps}
                    required
                    fullWidth
                    label="Номер телефона"
                    error={!!phoneError}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Tooltip title="Введите полный номер телефона в формате +7 XXX XXX XX XX" arrow>
                            <InfoIcon sx={{ fontSize: '20px', color: 'action.active', cursor: 'help' }} />
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </InputMask>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                required
                fullWidth
                value={email}
                onChange={handleEmailChange}
                label="Email"
                type="email"
                error={!!emailError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Tooltip title="Email должен быть в формате example@example.com" arrow>
                        <InfoIcon sx={{ fontSize: '20px', color: 'action.active', cursor: 'help' }} />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                required
                fullWidth
                value={password}
                onChange={handlePasswordChange}
                label="Пароль"
                type={showPassword ? 'text' : 'password'}
                error={!!passwordError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Tooltip title="Пароль должен содержать минимум 8 символов" arrow>
                        <InfoIcon sx={{ fontSize: '20px', color: 'action.active', cursor: 'help' }} />
                      </Tooltip>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                required
                fullWidth
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                label="Подтвердите пароль"
                type={showConfirmPassword ? 'text' : 'password'}
                error={!!confirmPasswordError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <FormControl fullWidth required>
              <InputLabel>Роль</InputLabel>
              <Select
                value={role}
                label="Роль"
                onChange={(e) => setRole(e.target.value as 'user' | 'owner')}
              >
                <MenuItem value="user">Водитель</MenuItem>
                <MenuItem value="owner">Владелец парковки</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={status === "loading" || !!surnameError || !!nameError || 
                !!patronymicError || !!phoneError || !!emailError || 
                !!passwordError || !!confirmPasswordError}
              sx={{ mt: 2 }}
            >
              {status === "loading" ? "Загрузка..." : "Зарегистрироваться"}
            </Button>
          </Stack>
        </Box>
        <Button
          variant="text"
          component={Link}
          to="/signin"
          sx={{ mt: 2, color: "grey.500" }}
        >
          Уже есть аккаунт? Войдите
        </Button>
      </Box>
    </Container>
  );
}