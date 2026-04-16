interface IContentService {
  getHighlights(): Promise<string[]>;
}

const ContentService: IContentService = {
  async getHighlights() {
    return [];
  },
};

export { ContentService };
