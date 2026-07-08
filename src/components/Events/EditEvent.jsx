import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import {
  fetchEvent,
  updateEvent,
  queryClient,
} from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();

  const {
    data,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) =>
      fetchEvent({
        signal,
        id: params.id,
      }),
  });

  const { mutate } = useMutation({
    mutationFn: updateEvent,

    onMutate: async (data) => {
      const updatedEvent = data.event;

      // Cancela queries em andamento
      await queryClient.cancelQueries({
        queryKey: ['events'],
      });

      // Guarda dados antigos para rollback
      const previousEvent = queryClient.getQueryData([
        'events',
        params.id,
      ]);

      const previousEvents = queryClient.getQueryData([
        'events',
      ]);

      // Atualiza cache do evento individual
      queryClient.setQueryData(
        ['events', params.id],
        {
          ...previousEvent,
          ...updatedEvent,
        }
      );

      // Atualiza cache da lista de eventos
      queryClient.setQueryData(
        ['events'],
        (oldEvents) => {
          if (!oldEvents) return oldEvents;

          return oldEvents.map((event) =>
            event.id === params.id
              ? {
                  ...event,
                  ...updatedEvent,
                }
              : event
          );
        }
      );

      return {
        previousEvent,
        previousEvents,
      };
    },

    onError: (error, variables, context) => {
      // Rollback
      queryClient.setQueryData(
        ['events', params.id],
        context.previousEvent
      );

      queryClient.setQueryData(
        ['events'],
        context.previousEvents
      );
    },

    onSettled: () => {
      // Garante sincronização com o servidor
      queryClient.invalidateQueries({
        queryKey: ['events'],
      });
    },
  });

  function handleSubmit(formData) {
    mutate({
      id: params.id,
      event: formData,
    });

    navigate('../');
  }

  function handleClose() {
    navigate('../');
  }

  return (
    <Modal onClose={handleClose}>
      {isPending && (
        <div className="center">
          <LoadingIndicator />
        </div>
      )}

      {isError && (
        <ErrorBlock
          title="Error on loading event details"
          message="Please try again later"
        />
      )}

      {data && (
        <EventForm
          inputData={data}
          onSubmit={handleSubmit}
        >
          <Link
            to="../"
            className="button-text"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="button"
          >
            Update
          </button>
        </EventForm>
      )}
    </Modal>
  );
}