import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  Box,
  Typography,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField, Container,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import ParkingConstructor from "../constructor/ParkingConstructor";

export default function ParkingOwnerPage() {
  const { user } = useAppSelector((state) => state.auth);
 
  const dispatch = useAppDispatch();

  
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 4,
      }}
    >
      <Autocomplete
        disablePortal
        sx={{ width: 300 }}
        renderInput={(params) => <TextField {...params} label="Парковка" />}
        options={[]}
      />

      <Container
        maxWidth="xl"
        sx={{
          display: "flex",
          gap: 4, // Добавляем отступ между элементами
          justifyContent: "space-around",
          margin: 10,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            m: 0, // Убираем margin у Box'ов, чтобы избежать наложения отступов
            borderRadius: 5,
            height: "100%",
            width: "60%",
          }}
        >
          Тут элемент с местами на парковке
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            m: 0, // Убираем margin у Box'ов, чтобы избежать наложения отступов
            p: 5,
            borderRadius: 5,
            height: "100%",
            width: "40%",
            gap: 1,
          }}
        >
          <TextField
            required
            fullWidth
            name="name"
            label="Название"
            size="small"
          />
          <TextField
            required
            fullWidth
            size="small"
            name="price_per_hour"
            label="Укажите стоимость"
          />
          <Select
            name="status"
            label="Статус"
            defaultValue=""
            fullWidth
            size="small"
          >
            <MenuItem value="true">Работает</MenuItem>
            <MenuItem value="false">Не работает</MenuItem>
          </Select>
          <Button fullWidth variant="outlined" size="small">
            Добавить парковочные места
          </Button>
          <Button fullWidth variant="outlined" size="small">
            Статистика
          </Button>
          <Button fullWidth variant="outlined" size="small">
            Посмотреть отзывы
          </Button>
          <Button type="submit" fullWidth variant="contained">
            Сохранить изменения
          </Button>
          {/* <ParkingConstructor /> */}
        </Box>
      </Container>
    </Box>
  );
}
