import axios from "axios";

interface PeopleRequest {}

export interface User {
  _id: string;
  username: string;
}
interface PeopleResponse {
  data: User[];
}

const getPeople = async (request: PeopleRequest): Promise<PeopleResponse> => {
  const response = await axios.get("/people");
  return response;
};

export const PeopleApi = { getPeople };
