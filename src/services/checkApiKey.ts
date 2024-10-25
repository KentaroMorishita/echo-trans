export const checkApiKey =
  (apiKey: string) =>
  async <T>(data: T) => {
    if (!apiKey) {
      alert("Please enter the API Key")
      throw new Error("API Key is required")
    }

    return data
  }
