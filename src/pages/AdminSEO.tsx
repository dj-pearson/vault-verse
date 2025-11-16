import { useState } from 'react';
import { Save, Plus, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  useSEOSettings,
  useUpdateSEOSettings,
  usePageMetadata,
  useUpsertPageMetadata,
  useDeletePageMetadata,
  useSitemapEntries,
  useUpsertSitemapEntry,
  useDeleteSitemapEntry,
} from '@/hooks/useSEO';
import { getSitemapXML } from '@/utils/sitemap';

export const AdminSEO = () => {
  const { data: settings } = useSEOSettings();
  const updateSettings = useUpdateSEOSettings();
  const { data: pageMetadata } = usePageMetadata();
  const upsertPageMetadata = useUpsertPageMetadata();
  const deletePageMetadata = useDeletePageMetadata();
  const { data: sitemapEntries } = useSitemapEntries();
  const upsertSitemapEntry = useUpsertSitemapEntry();
  const deleteSitemapEntry = useDeleteSitemapEntry();

  const [globalSettings, setGlobalSettings] = useState({
    site_name: settings?.site_name || 'VaultVerse',
    site_description: settings?.site_description || '',
    default_og_image: settings?.default_og_image || '',
    google_analytics_id: settings?.google_analytics_id || '',
    robots_txt: settings?.robots_txt || '',
  });

  const [newPageMetadata, setNewPageMetadata] = useState({
    page_path: '',
    page_title: '',
    meta_description: '',
  });

  const [newSitemapEntry, setNewSitemapEntry] = useState({
    url: '',
    priority: 0.5,
    change_frequency: 'weekly',
  });

  const handleSaveSettings = async () => {
    try {
      await updateSettings.mutateAsync(globalSettings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  const handleAddPageMetadata = async () => {
    try {
      await upsertPageMetadata.mutateAsync({
        ...newPageMetadata,
        no_index: false,
        no_follow: false,
      });
      setNewPageMetadata({ page_path: '', page_title: '', meta_description: '' });
      alert('Page metadata added!');
    } catch (error) {
      console.error('Error adding page metadata:', error);
      alert('Failed to add page metadata');
    }
  };

  const handleDeletePageMetadata = async (id: string) => {
    if (confirm('Are you sure you want to delete this page metadata?')) {
      await deletePageMetadata.mutateAsync(id);
    }
  };

  const handleAddSitemapEntry = async () => {
    try {
      await upsertSitemapEntry.mutateAsync({
        ...newSitemapEntry,
        enabled: true,
        auto_generated: false,
      });
      setNewSitemapEntry({ url: '', priority: 0.5, change_frequency: 'weekly' });
      alert('Sitemap entry added!');
    } catch (error) {
      console.error('Error adding sitemap entry:', error);
      alert('Failed to add sitemap entry');
    }
  };

  const handleDeleteSitemapEntry = async (id: string) => {
    if (confirm('Are you sure you want to delete this sitemap entry?')) {
      await deleteSitemapEntry.mutateAsync(id);
    }
  };

  const handleDownloadSitemap = async () => {
    try {
      const xml = await getSitemapXML();
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      alert('Failed to generate sitemap');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">SEO Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage global SEO settings, page metadata, and sitemap
        </p>
      </div>

      <Tabs defaultValue="global" className="w-full">
        <TabsList>
          <TabsTrigger value="global">Global Settings</TabsTrigger>
          <TabsTrigger value="pages">Page Metadata</TabsTrigger>
          <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
        </TabsList>

        {/* Global Settings */}
        <TabsContent value="global">
          <Card>
            <CardHeader>
              <CardTitle>Global SEO Settings</CardTitle>
              <CardDescription>
                Configure default SEO settings for your entire site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="site-name">Site Name</Label>
                <Input
                  id="site-name"
                  value={globalSettings.site_name}
                  onChange={(e) =>
                    setGlobalSettings({ ...globalSettings, site_name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="site-description">Site Description</Label>
                <Textarea
                  id="site-description"
                  value={globalSettings.site_description}
                  onChange={(e) =>
                    setGlobalSettings({
                      ...globalSettings,
                      site_description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="og-image">Default OG Image URL</Label>
                <Input
                  id="og-image"
                  value={globalSettings.default_og_image}
                  onChange={(e) =>
                    setGlobalSettings({
                      ...globalSettings,
                      default_og_image: e.target.value,
                    })
                  }
                  placeholder="https://example.com/og-image.png"
                />
              </div>

              <div>
                <Label htmlFor="ga-id">Google Analytics ID</Label>
                <Input
                  id="ga-id"
                  value={globalSettings.google_analytics_id}
                  onChange={(e) =>
                    setGlobalSettings({
                      ...globalSettings,
                      google_analytics_id: e.target.value,
                    })
                  }
                  placeholder="G-XXXXXXXXXX"
                />
              </div>

              <div>
                <Label htmlFor="robots">robots.txt Content</Label>
                <Textarea
                  id="robots"
                  value={globalSettings.robots_txt}
                  onChange={(e) =>
                    setGlobalSettings({ ...globalSettings, robots_txt: e.target.value })
                  }
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={handleSaveSettings} disabled={updateSettings.isPending}>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Page Metadata */}
        <TabsContent value="pages">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Add Page Metadata</CardTitle>
              <CardDescription>Add SEO metadata for a specific page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Page Path</Label>
                  <Input
                    placeholder="/features"
                    value={newPageMetadata.page_path}
                    onChange={(e) =>
                      setNewPageMetadata({
                        ...newPageMetadata,
                        page_path: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Page Title</Label>
                  <Input
                    placeholder="Features"
                    value={newPageMetadata.page_title}
                    onChange={(e) =>
                      setNewPageMetadata({
                        ...newPageMetadata,
                        page_title: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddPageMetadata} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea
                  placeholder="Page description..."
                  value={newPageMetadata.meta_description}
                  onChange={(e) =>
                    setNewPageMetadata({
                      ...newPageMetadata,
                      meta_description: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Page Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Path</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageMetadata?.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-mono">{page.page_path}</TableCell>
                      <TableCell>{page.page_title}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {page.meta_description}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePageMetadata(page.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sitemap */}
        <TabsContent value="sitemap">
          <Card className="mb-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Sitemap Management</CardTitle>
                  <CardDescription>
                    Manage sitemap entries (auto-generated for blog posts)
                  </CardDescription>
                </div>
                <Button onClick={handleDownloadSitemap}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Sitemap
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>URL</Label>
                  <Input
                    placeholder="/features"
                    value={newSitemapEntry.url}
                    onChange={(e) =>
                      setNewSitemapEntry({ ...newSitemapEntry, url: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Priority (0.0-1.0)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={newSitemapEntry.priority}
                    onChange={(e) =>
                      setNewSitemapEntry({
                        ...newSitemapEntry,
                        priority: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Change Frequency</Label>
                  <Select
                    value={newSitemapEntry.change_frequency}
                    onValueChange={(v) =>
                      setNewSitemapEntry({ ...newSitemapEntry, change_frequency: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">Always</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddSitemapEntry} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Entry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sitemap Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Change Freq</TableHead>
                    <TableHead>Auto-Generated</TableHead>
                    <TableHead>Enabled</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sitemapEntries?.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono">{entry.url}</TableCell>
                      <TableCell>{entry.priority.toFixed(1)}</TableCell>
                      <TableCell>{entry.change_frequency}</TableCell>
                      <TableCell>{entry.auto_generated ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{entry.enabled ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSitemapEntry(entry.id)}
                          disabled={entry.auto_generated}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
