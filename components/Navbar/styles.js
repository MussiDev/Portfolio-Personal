import styled from "styled-components";

export const Header = styled.header`
	position: fixed;
	width: 100%;
	box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1),
		0 8px 10px -6px rgb(0 0 0 / 0.1);
	z-index: 100;
	transition: all ease-in-out 300ms;
	display: flex;
	justify-content: space-between;
	height: 4rem;
	padding: 0 2.5rem;
	font-size: 1.125rem;
	line-height: 1.75rem;
	backdrop-filter: blur(12px);
	background-color: #1e293b;
`;
