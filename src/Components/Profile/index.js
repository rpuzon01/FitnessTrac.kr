import axios from 'axios';
import { useState, useEffect } from 'react';
import { Routine, AddRoutine } from '../';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const Profile = ({user, token, routines, setRoutines, handleRoutines}) => {
	const [userRoutines, setUserRoutines] = useState([]);

	const navigate = useNavigate();

	const handleDelete = async (routineId) => {
		try {
			const { data } = await axios.delete(`/api/routines/${routineId}`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			if (data.success === false) {
				throw error;
			}
			setUserRoutines(userRoutines.filter((routine) => routine.id !== routineId))
			handleRoutines();
		} catch (error) {
			console.error('error');
		}
	}

	const handleUserRoutines = async () => {
		try {
			const { data } = await axios.get(`/api/users/${user.username}/routines`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			if(data.success === false) {
				return;
			}
			setUserRoutines(data);
		} catch (error) {
			console.error(error);
		}
	}

	useEffect(() => {
		handleUserRoutines();
	}, [user, routines]);

	if(userRoutines.length === 0) {
		return (
			<div>
				...Loading
			</div>
		)
	}

	return (
		<div className='profile'>
			<div>
				{token && <AddRoutine handleRoutines={handleRoutines} setRoutines={setRoutines} routines={routines} token={token} />}
				<h2>My Routines</h2>
				{userRoutines.map((routine) => {
					return (
						<Routine key={routine.id} routine={routine}>
							<button onClick={() => navigate(`/routines/${routine.id}`)}>Edit</button>
							<button onClick={() => handleDelete(routine.id)}>Delete</button>
						</Routine>
					);
				})}
			</div>
		</div>
	)
}

export default Profile;