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
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

export default function SignUp() {
  const dispatch = useAppDispatch();
  const { error, status } = useAppSelector((state) => state.auth);
  const [formError, setFormError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    const formData = new FormData(e.currentTarget);
    const credentials = {
      name: formData.get("name") as string,
      surname: formData.get("surname") as string,
      patronymic: formData.get("patronymic") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      role: formData.get("role") as "user" | "owner",
    };

    if (credentials.password !== credentials.confirmPassword) {
      setFormError("Пароли не совпадают");
      return;
    }

    await dispatch(
      signUp({
        name: credentials.name,
        surname: credentials.surname,
        patronymic: credentials.patronymic,
        phone: Number(credentials.phone),
        email: credentials.email,
        password: credentials.password,
        role: credentials.role,
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
        <Typography component="h1" variant="h5" >
          Регистрация
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 3, width: "100%" }}
        >
          <Stack spacing={2}>
            {/* {(error || formError) && (
              <Typography color="error">{formError || error}</Typography>
            )} */}
            <TextField required fullWidth name="name" label="Имя" autoFocus />
            <TextField required fullWidth name="surname" label="Фамилия" />
            <TextField fullWidth name="patronymic" label="Отчество" />
            <TextField
              required
              fullWidth
              name="phone"
              label="Номер телефона"
              type="tel"
            />
            <TextField
              required
              fullWidth
              name="email"
              label="Email"
              type="email"
            />
            <TextField
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
            />
            <TextField
              required
              fullWidth
              name="confirmPassword"
              label="Подтвердите пароль"
              type="password"
            />
            <FormControl fullWidth required>
              <InputLabel>Роль</InputLabel>
              <Select name="role" label="Роль" defaultValue="user">
                <MenuItem value="user">Водитель</MenuItem>
                <MenuItem value="owner">Владелец парковки</MenuItem>
              </Select>
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={status === "loading"}
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
