import generateEmbedding from "../utils/embed";
import * as apiResponse from "../helpers/apiResponse";

const generateFileEmbeddings = [
  async (req: any, res: any) => {
    try {
      const { inputFileName, client } = req.body;
      await generateEmbedding(inputFileName, client);

      return apiResponse.successResponseWithData(
        res,
        "Successfully completed!",
        {}
      );
    } catch (err: any) {
      console.log("Error - ", err.message);
      return apiResponse.ErrorResponse(res, err.message);
    }
  },
];
export { generateFileEmbeddings };
