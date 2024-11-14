import * as React from "react";
import { Box, Typography, Button, styled } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const StyledBox = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "80vh",
  padding: "20px",
});

export default function ErrorPage() {
  return (
    <StyledBox>    
      <Typography variant="h1" component="h1" gutterBottom>
        Ой! Что-то пошло не так
      </Typography>
      <Typography variant="body1" gutterBottom>
        Страница находится в разработке
      </Typography>
      <Box mt={4}>
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          color="primary"
          size="large"
        >
          На главную
        </Button>       
      </Box>
    </StyledBox>
  );
}
