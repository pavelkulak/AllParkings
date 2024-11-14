import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  Box,
  Typography,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Container,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Modal,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import ParkingConstructor from "../constructor/ParkingConstructor";

interface IParkingOption {
  label: string;
  value: number | string;
}

export default function ParkingOwnerPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleDeleteClick = () => {
    if (window.confirm("Вы уверены, что хотите удалить?")) {
      // Логика удаления здесь
      console.log("Удаление подтверждено");
    }
  };

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
        options={[] as IParkingOption[]}
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
          <Button
            fullWidth
            variant="outlined"
            size="small"
            onClick={handleOpen}
          >
            Добавить новую парковку          
          </Button>
          <Modal
            open={isModalOpen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "60%",
                bgcolor: "background.paper",
                boxShadow: 24,
                p: 4,
              }}
            >
              <ParkingConstructor />
            </Box>
          </Modal>
          <Button fullWidth variant="outlined" size="small">
            Статистика
          </Button>
          <Button fullWidth variant="outlined" size="small">
            Посмотреть отзывы
          </Button>
          <Button fullWidth variant="contained" size="small" type="submit">
            Сохранить изменения
          </Button>
          <Button
            fullWidth
            variant="contained"
            size="small"
            color="error"
            type="submit"
            onClick={handleDeleteClick}
          >
            Удалить
          </Button>
        </Box>
      </Container>
    </Box>
  );
}


