import { PageHeader } from "@/components/layouts/general/PageHeader";
import { LoadingSpinner } from "@/components/spinners/LoadingSpinner";
import {
  EventSearchQueryParams,
  useEventsQuery,
} from "@/react_queries/events/useEventsQuery";
import { Box, Container, Grid, Pagination, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { NewEventFormProvider } from "./NewEventFormProvider";
import { NewEventForm } from "./NewEeventForm";

export const NewEvent = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#F0F0F0",
        overflowY: "scroll",
      }}
    >
      <PageHeader sx={{ height: "64px" }}>
        <Typography variant="h6">新規イベント作成</Typography>
      </PageHeader>
      <Container maxWidth="sm" sx={{ paddingY: "24px", background: "white" }}>
        <NewEventFormProvider>
          <NewEventForm />
        </NewEventFormProvider>
      </Container>
    </Box>
  );
};
