import { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  Tabs, 
  Tab,
  Stack,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Material Icons
import SearchIcon from '@mui/icons-material/Search';
import PaymentIcon from '@mui/icons-material/Payment';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import BusinessIcon from '@mui/icons-material/Business';
import EditLocationIcon from '@mui/icons-material/EditLocation';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import MapIcon from '@mui/icons-material/Map';
import SettingsIcon from '@mui/icons-material/Settings';
import { Star, StarBorder, Favorite, LocationOn } from '@mui/icons-material';

import LocalParkingIcon from '@mui/icons-material/LocalParking';
import parkingImage from '../../assets/images/parking.png';
import parkingMobileImage from '../../assets/images/Parking_mobile.png';
import InteractivePark from "../../assets/images/InteractivePark.png";
// import favoriteScreenshot from '../../assets/images/favorite-screenshot.png';
// import reviewsScreenshot from '../../assets/images/reviews-screenshot.png';
// import constructorScreenshot from '../../assets/images/constructor-screenshot.png';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const driverFeatures = [
    {
      icon: <SearchIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Поиск парковок',
      description: 'Находите удобные парковки рядом с вашим местоположением'
    },
    {
      icon: <PaymentIcon sx={{ fontSize: 40, color: 'black' }} />,
      title: 'Онлайн оплата',
      description: 'Оплачивайте парковку через приложение без лишних хлопот (в разработке)',
      inDevelopment: true
    },
    {
      icon: <StarBorder sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Отзывы и оценки',
      description: 'Делитесь своим опытом и читайте отзывы других водителей'
    },
    {
      icon: <Favorite sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Избранное',
      description: 'Сохраняйте любимые парковки для быстрого доступа'
    }
  ];

  const ownerFeatures = [
    {
      icon: <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Управление парковкой',
      description: 'Добавляйте и редактируйте информацию о вашей парковке'
    },
    {
      icon: <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Рейтинг и отзывы',
      description: 'Отслеживайте рейтинг и читайте отзывы о вашей парковке'
    },
    {
      icon: <EditLocationIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Настройка мест',
      description: 'Управляйте схемой парковки и количеством мест'
    },
    {
      icon: <AssessmentIcon sx={{ fontSize: 40, color: 'black' }} />,
      title: 'Статистика',
      description: 'Отслеживайте загруженность и доход',
      inDevelopment: true
    },
    {
      icon: <PaymentIcon sx={{ fontSize: 40, color: 'black' }} />,
      title: 'Управление ценами',
      description: 'Гибкая настройка тарифов',
      inDevelopment: true
    }
  ];

  return (
    <Box>
      {/* Hero секция */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" gutterBottom>
                ALLPARKINGS
              </Typography>
              <Typography variant="h5" gutterBottom>
                Умная система бронирования парковочных мест
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{
                  mt: 4,
                  bgcolor: "white",
                  color: "primary.main",
                  "&:hover": {
                    bgcolor: "grey.100",
                  },
                }}
                onClick={() => navigate("/parkings/map")}
              >
                Найти парковку
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={parkingImage}
                alt="Парковка"
                sx={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Tabs дл переключения между воителями и владельцами */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{ mb: 4 }}
        >
          <Tab label="Для водителей" />
          <Tab label="Для владельцев парковок" />
        </Tabs>

        {/* Контент для водителей */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h3" textAlign="center" gutterBottom>
              Возможности для водителей
            </Typography>
            <Grid container spacing={4} sx={{ mt: 4 }}>
              {driverFeatures.map((feature, index) => (
                <Grid item xs={12} md={3} key={index}>
                  <Paper
                    sx={{
                      p: 3,
                      height: "280px",
                      textAlign: "center",
                      position: "relative",
                      bgcolor: feature.inDevelopment
                        ? "warning.light"
                        : "background.paper",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography
                      color={feature.inDevelopment ? "black" : "text.secondary"}
                    >
                      {feature.description}
                    </Typography>
                    {feature.inDevelopment && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          bgcolor: "warning.main",
                          color: "black",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: "0.75rem",
                        }}
                      >
                        В разработке
                      </Box>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Секция поиска машины */}
            <Box sx={{ bgcolor: "grey.100", py: 8, mt: 8 }}>
              <Container maxWidth="lg">
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Typography variant="h3" gutterBottom>
                      Никогда не теряйте свою машину
                    </Typography>
                    <Typography variant="body1" paragraph>
                      Благодаря интерактивной схеме парковки, вы всегда будете
                      знать, где оставили свой автомобиль. Ваше место парковки
                      будет сохранено в приложении и вы легко найдете его при
                      возвращении.
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <DirectionsCarIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Легкий поиск"
                          secondary="Быстро находите свой автомобиль по сохраненной метке"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <MapIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Интерактивная схема"
                          secondary="Визуальное отображение всех уровней парковки"
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box
                      component="img"
                      src={InteractivePark}
                      alt="Схема парковки"
                      sx={{
                        width: "100%",
                        height: "auto",
                        borderRadius: 2,
                        boxShadow: 3,
                        display: "block",
                        objectFit: "contain",
                      }}
                    />
                  </Grid>
                </Grid>
              </Container>
            </Box>
          </Box>
        )}

        {/* Контент для владельцев */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h3" textAlign="center" gutterBottom>
              Возможности для владельцев
            </Typography>
            <Grid container spacing={4} sx={{ mt: 4 }}>
              {ownerFeatures.map((feature, index) => (
                <Grid item xs={12} md={2.4} key={index}>
                  <Paper
                    sx={{
                      p: 3,
                      height: "280px",
                      textAlign: "center",
                      position: "relative",
                      bgcolor: feature.inDevelopment
                        ? "warning.light"
                        : "background.paper",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography
                      color={feature.inDevelopment ? "black" : "text.secondary"}
                    >
                      {feature.description}
                    </Typography>
                    {feature.inDevelopment && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          bgcolor: "warning.main",
                          color: "black",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: "0.75rem",
                        }}
                      >
                        В разработке
                      </Box>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>

      {/* Секция о мобильном приложении */}
      <Box sx={{ bgcolor: "grey.100", py: 8, mt: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" gutterBottom>
                Скоро на мобильных устройствах
              </Typography>
              <Typography variant="body1" paragraph>
                Мы разрабатываем мобильное приложение для еще более удобного
                использования сервиса. Бронируйте парковочные места, оплачивайте
                услуги и получайте уведомления прямо на вашем смартфоне.
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
                <PhoneIphoneIcon sx={{ fontSize: 60 }} color="primary" />
                <Typography variant="h6" sx={{ mt: 1 }}>
                  Ожидайте в 2024
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                alt="Мобильное приложение"
                src={parkingMobileImage}
                sx={{ width: "100%" }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};