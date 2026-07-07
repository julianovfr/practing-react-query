import { Link, Outlet, useParams,useNavigate } from 'react-router-dom';

import Header from '../Header.jsx';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchEvent, deleteEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';


export default function EventDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {data, isPending, isError, error} = useQuery({
    queryKey: ['events', 'details', id],
    queryFn: () => fetchEvent({id}),
  });

  const {mutate} = useMutation({
    mutationFn: () => deleteEvent({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['events']});
      navigate('/events');
    }
  });

  function handleDelete(){
    mutate({id});
  }

  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isPending && <p>Loading details..</p>}
      {isError && 
        <ErrorBlock
          title = "Failed to load details events" 
          message = "Please try again later"
        />}
      {data && <article id="event-details">
        <header>
          <h1>{data?.title}</h1>
          <nav>
            <button onClick={handleDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
        <img src={"http://localhost:3212/" + data?.image} alt="imagem do evento" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data?.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{data?.date} @ {data?.time}</time>
            </div>
            <p id="event-details-description">{data?.description}</p>
          </div>
        </div>
      </article>}
      
    </>
  );
}
