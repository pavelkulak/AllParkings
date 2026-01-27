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
  useTheme,
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
import BusinessIcon from '@mui/icons-material/Business';
import EditLocationIcon from '@mui/icons-material/EditLocation';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MapIcon from '@mui/icons-material/Map';
import { StarBorder, Favorite } from '@mui/icons-material';

import parkingImage from '../../assets/images/parking.png';
import InteractivePark from "../../assets/images/InteractivePark.png";

export const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const driverFeatures: Array<{
    icon: React.ReactElement;
    title: string;
    description: string;
    inDevelopment?: boolean;
    textColor?: string;
  }> = [
      {
        icon: <SearchIcon sx={{ fontSize: 40, color: "primary.main" }} />,
        title: "Поиск парковок",
        description: "Находите удобные парковки рядом с вашим местоположением",
      },

      {
        icon: <StarBorder sx={{ fontSize: 40, color: "primary.main" }} />,
        title: "Отзывы и оценки",
        description: "Делитесь своим опытом и читайте отзывы других водителей",
      },
      {
        icon: <Favorite sx={{ fontSize: 40, color: "primary.main" }} />,
        title: "Избранное",
        description: "Сохрайте любимые парковки для быстрого доступа",
      },
      {
        icon: <PaymentIcon sx={{ fontSize: 40, color: "white" }} />,
        title: "Онлайн оплата",
        description:
          "Оплачивайте парковку через приложение без лишних хлопот",
        inDevelopment: true,
        textColor: theme.palette.mode === "dark" ? "white" : "black",
      }
    ];

  const ownerFeatures: Array<{
    icon: React.ReactElement;
    title: string;
    description: string;
    inDevelopment?: boolean;
    textColor?: string;
  }> = [
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
        icon: <AssessmentIcon sx={{ fontSize: 40, color: 'white' }} />,
        title: 'Статистика',
        description: 'Отслеживайте загруженность и доход',
        inDevelopment: true
      },
      {
        icon: <PaymentIcon sx={{ fontSize: 40, color: 'white' }} />,
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
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
            : 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
          color: "white",
          py: { xs: 6, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  mb: 2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                ALLPARKINGS
              </Typography>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  mb: 3,
                  fontSize: { xs: '1.1rem', md: '1.5rem' },
                  opacity: 0.95,
                  fontWeight: 300,
                }}
              >
                Умная система бронирования парковочных мест
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{
                  mt: 2,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  bgcolor: "white",
                  color: "primary.main",
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: '0 4px 14px 0 rgba(0,0,0,0.2)',
                  "&:hover": {
                    bgcolor: "grey.100",
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px 0 rgba(0,0,0,0.3)',
                  },
                  transition: 'all 0.3s ease',
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
                  borderRadius: 3,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                  transform: { xs: 'none', md: 'perspective(1000px) rotateY(-5deg)' },
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: { xs: 'none', md: 'perspective(1000px) rotateY(0deg) scale(1.02)' },
                  }
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Tabs для переключения между водителями и владельцами */}
      <Container maxWidth="lg" sx={{ mt: { xs: 6, md: 8 }, px: { xs: 2, md: 3 } }}>
        <Typography
          variant="h3"
          textAlign="center"
          gutterBottom
          sx={{
            fontWeight: 600,
            mb: 4,
            fontSize: { xs: '1.8rem', md: '2.5rem' },
          }}
        >
          Как это работает?
        </Typography>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{
            mb: 6,
            '& .MuiTab-root': {
              fontSize: { xs: '0.9rem', md: '1rem' },
              fontWeight: 600,
              minHeight: 48,
            }
          }}
        >
          <Tab label="Для водителей" />
          <Tab label="Для владельцев парковок" />
        </Tabs>

        {/* Контент для водителей */}
        {activeTab === 0 && (
          <Box>
            <Grid container spacing={{ xs: 2, md: 4 }} sx={{ mt: 2 }}>
              {driverFeatures.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    elevation={feature.inDevelopment ? 2 : 4}
                    sx={{
                      p: { xs: 2, md: 3 },
                      minHeight: { xs: "auto", md: "280px" },
                      textAlign: "center",
                      position: "relative",
                      bgcolor: feature.inDevelopment
                        ? theme.palette.mode === 'dark' ? "#f08b18" : "warning.light"
                        : "background.paper",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 8,
                      },
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        color: feature.textColor,
                        fontWeight: 600,
                        fontSize: { xs: '1rem', md: '1.25rem' },
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: feature.textColor,
                        fontSize: { xs: '0.875rem', md: '1rem' },
                      }}
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
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          fontWeight: 600,
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
            <Box
              sx={{
                bgcolor: theme.palette.mode === 'dark'
                  ? "grey.900"
                  : "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
                py: { xs: 6, md: 10 },
                mt: { xs: 6, md: 10 },
                borderRadius: { xs: 0, md: 4 },
                mx: { xs: 0, md: 2 },
              }}
            >
              <Container maxWidth="lg">
                <Grid container spacing={{ xs: 3, md: 6 }} alignItems="center">
                  <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
                    <Typography
                      variant="h3"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: '1.8rem', md: '2.5rem' },
                        mb: 3,
                      }}
                    >
                      Никогда не теряйте свою машину
                    </Typography>
                    <Typography
                      variant="body1"
                      paragraph
                      sx={{
                        fontSize: { xs: '1rem', md: '1.1rem' },
                        lineHeight: 1.8,
                        mb: 3,
                      }}
                    >
                      Благодаря интерактивной схеме парковки, вы всегда будете
                      знать, где оставили свой автомобиль. Ваше место парковки
                      будет сохранено в приложении и вы легко найдете его при
                      возвращении.
                    </Typography>
                    <List sx={{ pl: { xs: 0, md: 2 } }}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <DirectionsCarIcon
                            color="primary"
                            sx={{ fontSize: { xs: 32, md: 40 } }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary="Легкий поиск"
                          secondary="Быстро находите свой автомобиль по сохраненной метке"
                          primaryTypographyProps={{
                            sx: { fontWeight: 600, fontSize: { xs: '1rem', md: '1.1rem' } }
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <MapIcon
                            color="primary"
                            sx={{ fontSize: { xs: 32, md: 40 } }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary="Интерактивная схема"
                          secondary="Визуальное отображение всех уровней парковки"
                          primaryTypographyProps={{
                            sx: { fontWeight: 600, fontSize: { xs: '1rem', md: '1.1rem' } }
                          }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
                    <Box
                      component="img"
                      src={InteractivePark}
                      alt="Схема парковки"
                      sx={{
                        width: "100%",
                        height: "auto",
                        borderRadius: 3,
                        boxShadow: 6,
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
            <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mt: 2 }}>
              {ownerFeatures.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                  <Paper
                    elevation={feature.inDevelopment ? 2 : 4}
                    sx={{
                      p: { xs: 2, md: 3 },
                      minHeight: { xs: "auto", md: "280px" },
                      textAlign: "center",
                      position: "relative",
                      bgcolor: feature.inDevelopment
                        ? theme.palette.mode === 'dark' ? "#f08b18" : "warning.light"
                        : "background.paper",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 8,
                      },
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        color: feature.textColor,
                        fontWeight: 600,
                        fontSize: { xs: '1rem', md: '1.25rem' },
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: feature.textColor,
                        fontSize: { xs: '0.875rem', md: '1rem' },
                      }}
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
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          fontWeight: 600,
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

    </Box>
  );
};