import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

const apiurl = process.env.REACT_APP_API_BASE_URL;

const Signup = () => {
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        age: "",
        height: "",
        weight: "",
        ethnicity: "",
        sex: "",
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = ({ currentTarget: input }) => {
        setData({ ...data, [input.name]: input.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = `${apiurl}/users`;
            const { data: res } = await axios.post(url, data);
            navigate("/login");
        } catch (error) {
            if (
                error.response &&
                error.response.status >= 400 &&
                error.response.status <= 500
            ) {
                setError(error.response.data.message);
            }
        }
    };

    return (
        <div className={styles.signup_container}>
            <div className={styles.signup_form_container}>
                <div className={styles.left}>
                    <h1>Already a User?</h1>
					<p></p>
                    <Link to="/login">
                        <button type="button" className={styles.white_btn}>
                            Sign in
                        </button>
                    </Link>
                </div>
                <div className={styles.right}>
                    <form className={styles.form_container} onSubmit={handleSubmit}>
                        <h1>Create Account</h1>
						<p></p>
                        <input
                            type="text"
                            placeholder="First Name"
                            name="firstName"
                            onChange={handleChange}
                            value={data.firstName}
                            required
                            className={styles.input}
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            name="lastName"
                            onChange={handleChange}
                            value={data.lastName}
                            required
                            className={styles.input}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            onChange={handleChange}
                            value={data.email}
                            required
                            className={styles.input}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            name="password"
                            onChange={handleChange}
                            value={data.password}
                            required
                            className={styles.input}
                        />
                        <input
                            type="number"
                            placeholder="Age"
                            name="age"
                            onChange={handleChange}
                            value={data.age}
                            required
                            className={styles.input}
                        />
                        <input
                            type="text"
                            placeholder="Height (e.g., 5'10)"
                            name="height"
                            onChange={handleChange}
                            value={data.height}
                            required
                            className={styles.input}
                        />
                        <input
                            type="text"
                            placeholder="Weight (e.g., 180 lbs)"
                            name="weight"
                            onChange={handleChange}
                            value={data.weight}
                            required
                            className={styles.input}
                        />
                        <input
                            type="text"
                            placeholder="Ethnicity"
                            name="ethnicity"
                            onChange={handleChange}
                            value={data.ethnicity}
                            required
                            className={styles.input}
                        />
                        <select
                            name="sex"
                            onChange={handleChange}
                            value={data.sex}
                            required
                            className={styles.input}
                        >
                            <option value="" disabled>
                                Select Sex Assigned at Birth
                            </option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        {error && <div className={styles.error_msg}>{error}</div>}
                        <button type="submit" className={styles.green_btn}>
                            Sign Up
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
